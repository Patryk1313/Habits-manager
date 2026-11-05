import type {
  HabitFrequency,
  WeekDay,
} from "../components/FrequencyPicker";
import type { Habit } from "../types/habit";
import {
  addDays,
  differenceInDays,
  eachDay,
  getDateKey,
  maxDate,
  minDate,
  parseDateKey,
  parseDateTime,
  startOfDay,
  startOfWeekMonday,
} from "./date";

export {
  addDays,
  differenceInDays,
  eachDay,
  getDateKey,
  maxDate,
  minDate,
  parseDateKey,
  parseDateTime,
  startOfDay,
  startOfWeekMonday,
};

// =========================
// TYPY
// =========================

export type ProgressEntry = {
  habitId: string;
  date: string;
  completed: boolean;
  completedAt?: string | null;
};

export type ProgressRange = {
  start: Date;
  end: Date;
};

export type ProgressStats = {
  expected: number;
  completed: number;
  successRate: number;
  activeDays: number;
};

export type DailyProgressStats = {
  date: Date;
  dateKey: string;
  expected: number;
  completed: number;
  successRate: number;
  hasActivity: boolean;
};

export type OnTimeStats = {
  eligible: number;
  onTime: number;
  rate: number;
};

export type HabitSegment = {
  start: Date;
  // null = bez końca
  end: Date | null;
  frequency: HabitFrequency;
  // Punkt odniesienia dla interwałów.
  anchor: Date;
};

// =========================
// STAŁE
// =========================

const WEEK_DAY_MAP: Record<number, WeekDay> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

const FAR_PAST = new Date(0);

// =========================
// ŻYCIE NAWYKU
// =========================

export function getHabitStart(habit: Habit) {
  return parseDateTime(habit.createdAt);
}

export function getHabitEnd(habit: Habit) {
  if (habit.archived && habit.archivedAt) {
    return parseDateTime(habit.archivedAt);
  }

  return null;
}

type Interval = { start: Date; end: Date | null };

function intersect(first: Interval, second: Interval): Interval | null {
  const start = maxDate(first.start, second.start);
  let end: Date | null;

  if (first.end && second.end) {
    end = minDate(first.end, second.end);
  } else {
    end = first.end ?? second.end;
  }

  if (end && start > end) {
    return null;
  }

  return { start, end };
}

function subtractPeriod(
  interval: Interval,
  from: Date,
  to: Date
): Interval[] {
  const result: Interval[] = [];
  const dayBefore = addDays(from, -1);
  const dayAfter = addDays(to, 1);

  if (interval.start <= dayBefore) {
    result.push({
      start: interval.start,
      end: interval.end ? minDate(interval.end, dayBefore) : dayBefore,
    });
  }

  if (!interval.end || dayAfter <= interval.end) {
    result.push({
      start: maxDate(interval.start, dayAfter),
      end: interval.end,
    });
  }

  return result.filter(
    (item) => !item.end || item.start <= item.end
  );
}

const segmentCache = new WeakMap<Habit, HabitSegment[]>();

// Dzieli życie nawyku na odcinki o stałej częstotliwości, pomijając okresy archiwizacji.
export function getHabitSegments(habit: Habit): HabitSegment[] {
  const cached = segmentCache.get(habit);
  if (cached) {
    return cached;
  }

  const lifeStart = getHabitStart(habit);
  let alive: Interval[] = [
    { start: lifeStart, end: getHabitEnd(habit) },
  ];

  for (const period of habit.inactivePeriods ?? []) {
    const from = parseDateKey(period.from);
    const to = parseDateKey(period.to);
    alive = alive.flatMap((interval) =>
      subtractPeriod(interval, from, to)
    );
  }

  const revisions: (Interval & { frequency: HabitFrequency })[] = [
    ...(habit.history ?? []).map((revision) => ({
      start: parseDateKey(revision.effectiveFrom),
      end: parseDateKey(revision.effectiveTo) as Date | null,
      frequency: revision.frequency,
    })),
    {
      start: habit.effectiveFrom
        ? parseDateKey(habit.effectiveFrom)
        : FAR_PAST,
      end: null,
      frequency: habit.frequency,
    },
  ];

  const segments: HabitSegment[] = [];

  for (const revision of revisions) {
    for (const interval of alive) {
      const overlap = intersect(interval, revision);
      if (overlap) {
        segments.push({
          start: overlap.start,
          end: overlap.end,
          frequency: revision.frequency,
          anchor: maxDate(revision.start, lifeStart),
        });
      }
    }
  }

  segments.sort((a, b) => a.start.getTime() - b.start.getTime());
  segmentCache.set(habit, segments);

  return segments;
}

function getSegmentAt(habit: Habit, date: Date) {
  const day = startOfDay(date);

  return getHabitSegments(habit).find(
    (segment) =>
      segment.start <= day && (!segment.end || day <= segment.end)
  );
}

export function isHabitAliveOnDate(habit: Habit, date: Date) {
  return !!getSegmentAt(habit, date);
}

export function getFrequencyOnDate(habit: Habit, date: Date) {
  return getSegmentAt(habit, date)?.frequency ?? habit.frequency;
}

// =========================
// HARMONOGRAM
// =========================

function isScheduledOnSegment(segment: HabitSegment, date: Date) {
  const frequency = segment.frequency;

  if (frequency.type === "daily") {
    return true;
  }

  if (frequency.type === "selectedDays") {
    return frequency.selectedDays.includes(WEEK_DAY_MAP[date.getDay()]);
  }

  if (frequency.type === "interval") {
    const interval = Math.max(1, frequency.intervalDays);
    const difference = differenceInDays(date, segment.anchor);

    return difference >= 0 && difference % interval === 0;
  }

  // „X razy w tygodniu” nie ma konkretnych dni - liczymy je jako cel tygodniowy.
  return false;
}

export function isScheduledDay(habit: Habit, date: Date) {
  const segment = getSegmentAt(habit, date);

  return !!segment && isScheduledOnSegment(segment, startOfDay(date));
}

// =========================
// WYKONANIE
// =========================

const completedIndexCache = new WeakMap<
  ProgressEntry[],
  Map<string, Set<string>>
>();

// Indeks habitId -> zbiór dat. Zbiór usuwa też zdublowane wpisy z tego samego dnia.
function getCompletedIndex(entries: ProgressEntry[]) {
  const cached = completedIndexCache.get(entries);
  if (cached) {
    return cached;
  }

  const index = new Map<string, Set<string>>();

  for (const entry of entries) {
    if (!entry.completed) {
      continue;
    }

    let dates = index.get(entry.habitId);
    if (!dates) {
      dates = new Set();
      index.set(entry.habitId, dates);
    }
    dates.add(entry.date);
  }

  completedIndexCache.set(entries, index);

  return index;
}

export function hasCompletedEntry(
  entries: ProgressEntry[],
  habitId: string,
  date: Date
) {
  return (
    getCompletedIndex(entries)
      .get(habitId)
      ?.has(getDateKey(date)) ?? false
  );
}

// =========================
// X RAZY W TYGODNIU
// =========================

export function getTimesPerWeekStats(
  habit: Habit,
  range: ProgressRange,
  entries: ProgressEntry[]
) {
  const completedDates =
    getCompletedIndex(entries).get(habit.id) ?? new Set<string>();

  let expected = 0;
  let completed = 0;
  let availableDaysTotal = 0;

  for (const segment of getHabitSegments(habit)) {
    if (segment.frequency.type !== "timesPerWeek") {
      continue;
    }

    const effectiveStart = maxDate(range.start, segment.start);
    const effectiveEnd = segment.end
      ? minDate(range.end, segment.end)
      : range.end;

    if (effectiveStart > effectiveEnd) {
      continue;
    }

    const target = Math.max(1, segment.frequency.timesPerWeek);
    let weekStart = startOfWeekMonday(effectiveStart);

    while (weekStart <= effectiveEnd) {
      const segmentStart = maxDate(weekStart, effectiveStart);
      const segmentEnd = minDate(addDays(weekStart, 6), effectiveEnd);
      const availableDays =
        differenceInDays(segmentEnd, segmentStart) + 1;

      availableDaysTotal += availableDays;
      expected += (target * availableDays) / 7;

      let completedThisWeek = 0;
      for (const day of eachDay(segmentStart, segmentEnd)) {
        if (completedDates.has(getDateKey(day))) {
          completedThisWeek += 1;
        }
      }
      completed += Math.min(completedThisWeek, target);

      weekStart = addDays(weekStart, 7);
    }
  }

  expected = Math.min(availableDaysTotal, Math.ceil(expected));
  completed = Math.min(completed, expected);

  return { expected, completed };
}

export function calculateHabitBestStreak(
  habit: Habit,
  entries: ProgressEntry[]
) {
  const habitStart = getHabitStart(habit);
  const habitEnd = getHabitEnd(habit) ?? startOfDay(new Date());

  if (
    Number.isNaN(habitStart.getTime()) ||
    habitStart > habitEnd
  ) {
    return 0;
  }

  let currentStreak = 0;
  let bestStreak = 0;

  if (habit.frequency.type === "timesPerWeek") {
    let weekStart = startOfWeekMonday(habitStart);

    while (weekStart <= habitEnd) {
      const weekEnd = addDays(weekStart, 6);
      const stats = getTimesPerWeekStats(
        habit,
        {
          start: maxDate(weekStart, habitStart),
          end: minDate(weekEnd, habitEnd),
        },
        entries
      );

      if (stats.expected > 0) {
        if (stats.completed >= stats.expected) {
          currentStreak += 1;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else if (weekEnd <= habitEnd) {
          currentStreak = 0;
        }
      }

      weekStart = addDays(weekStart, 7);
    }

    return bestStreak;
  }

  for (const date of eachDay(habitStart, habitEnd)) {
    if (!isScheduledDay(habit, date)) {
      continue;
    }

    if (hasCompletedEntry(entries, habit.id, date)) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
}

// =========================
// STATYSTYKI OKRESU
// =========================

function toSuccessRate(completed: number, expected: number) {
  return expected > 0
    ? Math.min(100, Math.round((completed / expected) * 100))
    : 0;
}

export function calculateProgressStats(
  habits: Habit[],
  entries: ProgressEntry[],
  range: ProgressRange
): ProgressStats {
  const index = getCompletedIndex(entries);
  const activeDateKeys = new Set<string>();
  let expected = 0;
  let completed = 0;

  for (const habit of habits) {
    const weekly = getTimesPerWeekStats(habit, range, entries);
    expected += weekly.expected;
    completed += weekly.completed;

    const completedDates = index.get(habit.id);

    for (const segment of getHabitSegments(habit)) {
      const start = maxDate(range.start, segment.start);
      const end = segment.end
        ? minDate(range.end, segment.end)
        : range.end;

      if (start > end) {
        continue;
      }

      for (const date of eachDay(start, end)) {
        const key = getDateKey(date);
        const done = completedDates?.has(key) ?? false;

        if (done) {
          activeDateKeys.add(key);
        }

        if (isScheduledOnSegment(segment, date)) {
          expected += 1;
          if (done) {
            completed += 1;
          }
        }
      }
    }
  }

  return {
    expected,
    completed,
    successRate: toSuccessRate(completed, expected),
    activeDays: activeDateKeys.size,
  };
}

// =========================
// STATYSTYKI JEDNEGO DNIA
// =========================

export function calculateDailyProgressStats(
  habits: Habit[],
  entries: ProgressEntry[],
  date: Date
): DailyProgressStats {
  const day = startOfDay(date);
  const dateKey = getDateKey(day);
  let expected = 0;
  let completed = 0;
  let hasActivity = false;

  for (const habit of habits) {
    const segment = getSegmentAt(habit, day);
    if (!segment) {
      continue;
    }

    const done = hasCompletedEntry(entries, habit.id, day);
    if (done) {
      hasActivity = true;
    }

    // Cel tygodniowy nie ma dnia - wykonanie traktujemy jako 1/1.
    if (segment.frequency.type === "timesPerWeek") {
      if (done) {
        expected += 1;
        completed += 1;
      }
      continue;
    }

    if (isScheduledOnSegment(segment, day)) {
      expected += 1;
      if (done) {
        completed += 1;
      }
    }
  }

  return {
    date: day,
    dateKey,
    expected,
    completed,
    successRate: toSuccessRate(completed, expected),
    hasActivity,
  };
}

// =========================
// WYKONANIE W ZAPLANOWANEJ PORZE
// =========================

const TIME_WINDOWS: Record<string, [number, number]> = {
  morning: [5, 12],
  afternoon: [12, 17],
  evening: [17, 22],
};

export function isHourInTimeOfDay(type: string, hour: number) {
  if (type === "night") {
    return hour >= 22 || hour < 5;
  }

  const window = TIME_WINDOWS[type];

  return !!window && hour >= window[0] && hour < window[1];
}

// Liczy tylko wpisy oznaczone tego samego dnia, bo uzupełnione wstecz nie mówią o porze wykonania.
export function calculateOnTimeStats(
  habits: Habit[],
  entries: ProgressEntry[],
  range: ProgressRange
): OnTimeStats {
  const habitsById = new Map(habits.map((habit) => [habit.id, habit]));
  const startKey = getDateKey(range.start);
  const endKey = getDateKey(range.end);
  const seen = new Set<string>();
  let eligible = 0;
  let onTime = 0;

  for (const entry of entries) {
    const habit = habitsById.get(entry.habitId);
    const dedupeKey = `${entry.habitId}|${entry.date}`;

    if (
      !habit ||
      !entry.completed ||
      !entry.completedAt ||
      entry.date < startKey ||
      entry.date > endKey ||
      habit.timeOfDay?.type === "anytime" ||
      !habit.timeOfDay ||
      seen.has(dedupeKey)
    ) {
      continue;
    }

    const completedAt = new Date(entry.completedAt);
    if (
      Number.isNaN(completedAt.getTime()) ||
      getDateKey(completedAt) !== entry.date
    ) {
      continue;
    }

    seen.add(dedupeKey);
    eligible += 1;

    if (isHourInTimeOfDay(habit.timeOfDay.type, completedAt.getHours())) {
      onTime += 1;
    }
  }

  return {
    eligible,
    onTime,
    rate: toSuccessRate(onTime, eligible),
  };
}

// =========================
// TREND
// =========================

export function calculateProgressChange(
  current: number,
  previous: number
) {
  return Math.round(current - previous);
}
