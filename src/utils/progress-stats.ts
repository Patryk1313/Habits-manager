import type {
  WeekDay,
} from "../components/FrequencyPicker";

import type {
  Habit,
} from "../types/habit";

// =========================
// TYPY
// =========================

export type ProgressEntry = {
  habitId: string;

  date: string;

  completed: boolean;
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

// =========================
// STAŁE
// =========================

const DAY_MS =
  24 * 60 * 60 * 1000;

const WEEK_DAY_MAP: Record<
  number,
  WeekDay
> = {
  0: "sun",

  1: "mon",

  2: "tue",

  3: "wed",

  4: "thu",

  5: "fri",

  6: "sat",
};

// =========================
// DATY
// =========================

export function startOfDay(
  date: Date
) {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}

export function parseDateKey(
  value: string
) {
  return startOfDay(
    new Date(
      `${value}T00:00:00`
    )
  );
}

export function parseDateTime(
  value: string
) {
  return startOfDay(
    new Date(value)
  );
}

export function getDateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

export function addDays(
  date: Date,
  amount: number
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() +
      amount
  );

  return startOfDay(
    result
  );
}

export function differenceInDays(
  later: Date,
  earlier: Date
) {
  const laterUtc =
    Date.UTC(
      later.getFullYear(),
      later.getMonth(),
      later.getDate()
    );

  const earlierUtc =
    Date.UTC(
      earlier.getFullYear(),
      earlier.getMonth(),
      earlier.getDate()
    );

  return Math.round(
    (laterUtc -
      earlierUtc) /
      DAY_MS
  );
}

export function maxDate(
  first: Date,
  second: Date
) {
  return first >
    second
    ? first
    : second;
}

export function minDate(
  first: Date,
  second: Date
) {
  return first <
    second
    ? first
    : second;
}

export function startOfWeekMonday(
  date: Date
) {
  const result =
    startOfDay(
      date
    );

  const day =
    result.getDay();

  const distance =
    day === 0
      ? -6
      : 1 - day;

  return addDays(
    result,
    distance
  );
}

export function eachDay(
  start: Date,
  end: Date
) {
  const result: Date[] =
    [];

  let current =
    startOfDay(
      start
    );

  const last =
    startOfDay(
      end
    );

  while (
    current <= last
  ) {
    result.push(
      current
    );

    current =
      addDays(
        current,
        1
      );
  }

  return result;
}

// =========================
// ŻYCIE NAWYKU
// =========================

export function getHabitStart(
  habit: Habit
) {
  return parseDateTime(
    habit.createdAt
  );
}

export function getHabitEnd(
  habit: Habit
) {
  if (
    habit.archived &&
    habit.archivedAt
  ) {
    return parseDateTime(
      habit.archivedAt
    );
  }

  return null;
}

export function isHabitAliveOnDate(
  habit: Habit,
  date: Date
) {
  const habitStart =
    getHabitStart(
      habit
    );

  if (
    date < habitStart
  ) {
    return false;
  }

  const habitEnd =
    getHabitEnd(
      habit
    );

  if (
    habitEnd &&
    date > habitEnd
  ) {
    return false;
  }

  return true;
}

// =========================
// HARMONOGRAM
// =========================

export function isScheduledDay(
  habit: Habit,
  date: Date
) {
  if (
    !isHabitAliveOnDate(
      habit,
      date
    )
  ) {
    return false;
  }

  const frequency =
    habit.frequency;

  // =====================
  // CODZIENNIE
  // =====================

  if (
    frequency.type ===
    "daily"
  ) {
    return true;
  }

  // =====================
  // WYBRANE DNI
  // =====================

  if (
    frequency.type ===
    "selectedDays"
  ) {
    const weekDay =
      WEEK_DAY_MAP[
        date.getDay()
      ];

    return frequency.selectedDays.includes(
      weekDay
    );
  }

  // =====================
  // CO X DNI
  // =====================

  if (
    frequency.type ===
    "interval"
  ) {
    const interval =
      Math.max(
        1,
        frequency.intervalDays
      );

    const habitStart =
      getHabitStart(
        habit
      );

    const difference =
      differenceInDays(
        date,
        habitStart
      );

    return (
      difference >= 0 &&
      difference %
        interval ===
        0
    );
  }

  // =====================
  // X RAZY W TYGODNIU
  // =====================
  //
  // Nie ma konkretnych
  // zaplanowanych dni.
  // Ten typ liczymy jako
  // cel tygodniowy.
  // =====================

  return false;
}

// =========================
// WYKONANIE
// =========================

export function hasCompletedEntry(
  entries: ProgressEntry[],
  habitId: string,
  date: Date
) {
  const key =
    getDateKey(
      date
    );

  return entries.some(
    (entry) =>
      entry.habitId ===
        habitId &&
      entry.date === key &&
      entry.completed
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
  const target =
    Math.max(
      1,
      habit.frequency
        .timesPerWeek
    );

  const habitStart =
    getHabitStart(
      habit
    );

  const habitEnd =
    getHabitEnd(
      habit
    );

  const effectiveStart =
    maxDate(
      range.start,
      habitStart
    );

  const effectiveEnd =
    habitEnd
      ? minDate(
          range.end,
          habitEnd
        )
      : range.end;

  if (
    effectiveStart >
    effectiveEnd
  ) {
    return {
      expected: 0,

      completed: 0,
    };
  }

  let expected = 0;

  let completed = 0;
  let availableDaysTotal = 0;

  let weekStart =
    startOfWeekMonday(
      effectiveStart
    );

  while (
    weekStart <=
    effectiveEnd
  ) {
    const weekEnd =
      addDays(
        weekStart,
        6
      );

    const segmentStart =
      maxDate(
        weekStart,
        effectiveStart
      );

    const segmentEnd =
      minDate(
        weekEnd,
        effectiveEnd
      );

    if (
      segmentStart <=
      segmentEnd
    ) {
      const availableDays =
        differenceInDays(
          segmentEnd,
          segmentStart
        ) + 1;
      availableDaysTotal += availableDays;
      expected +=
        (target * availableDays) / 7;

      const completedThisWeek =
        entries.filter(
          (entry) => {
            if (
              entry.habitId !==
                habit.id ||
              !entry.completed
            ) {
              return false;
            }

            const entryDate =
              parseDateKey(
                entry.date
              );

            return (
              entryDate >=
                segmentStart &&
              entryDate <=
                segmentEnd
            );
          }
        ).length;
      completed +=
        Math.min(
          completedThisWeek,
          target
        );
    }

    weekStart =
      addDays(
        weekStart,
        7
      );
  }

  expected = Math.min(
    availableDaysTotal,
    Math.ceil(expected)
  );
  completed = Math.min(
    completed,
    expected
  );

  return {
    expected,

    completed,
  };
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

  if (habit.frequency.type === "timesPerWeek") {
    let weekStart = startOfWeekMonday(habitStart);
    let currentStreak = 0;
    let bestStreak = 0;

    while (weekStart <= habitEnd) {
      const weekEnd = addDays(weekStart, 6);
      const range = {
        start: maxDate(weekStart, habitStart),
        end: minDate(weekEnd, habitEnd),
      };
      const stats = getTimesPerWeekStats(habit, range, entries);

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

  let currentStreak = 0;
  let bestStreak = 0;
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

export function calculateProgressStats(
  habits: Habit[],
  entries: ProgressEntry[],
  range: ProgressRange
): ProgressStats {
  let expected = 0;

  let completed = 0;

  const activeDateKeys =
    new Set<string>();

  for (
    const habit of habits
  ) {
    // =====================
    // X RAZY W TYGODNIU
    // =====================

    if (
      habit.frequency
        .type ===
      "timesPerWeek"
    ) {
      const stats =
        getTimesPerWeekStats(
          habit,
          range,
          entries
        );

      expected +=
        stats.expected;

      completed +=
        stats.completed;

      continue;
    }

    // =====================
    // POZOSTAŁE
    // =====================

    const days =
      eachDay(
        range.start,
        range.end
      );

    for (
      const date of days
    ) {
      if (
        !isScheduledDay(
          habit,
          date
        )
      ) {
        continue;
      }

      expected += 1;

      if (
        hasCompletedEntry(
          entries,
          habit.id,
          date
        )
      ) {
        completed += 1;
      }
    }
  }

  // =====================
  // AKTYWNE DNI
  // =====================

  for (
    const entry of entries
  ) {
    if (
      !entry.completed
    ) {
      continue;
    }

    const entryDate =
      parseDateKey(
        entry.date
      );

    if (
      entryDate <
        range.start ||
      entryDate >
        range.end
    ) {
      continue;
    }

    const habit =
      habits.find(
        (item) =>
          item.id ===
          entry.habitId
      );

    if (
      !habit
    ) {
      continue;
    }

    if (
      !isHabitAliveOnDate(
        habit,
        entryDate
      )
    ) {
      continue;
    }

    activeDateKeys.add(
      entry.date
    );
  }

  const successRate =
    expected > 0
      ? Math.min(
          100,
          Math.round(
            (completed /
              expected) *
              100
          )
        )
      : 0;

  return {
    expected,

    completed,

    successRate,

    activeDays:
      activeDateKeys.size,
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
  const day =
    startOfDay(
      date
    );

  const dateKey =
    getDateKey(
      day
    );

  let expected = 0;

  let completed = 0;

  let hasActivity = false;

  // =========================
  // AKTYWNOŚĆ
  // =========================

  for (
    const entry of entries
  ) {
    if (
      entry.date !==
        dateKey ||
      !entry.completed
    ) {
      continue;
    }

    const habit =
      habits.find(
        (item) =>
          item.id ===
          entry.habitId
      );

    if (
      !habit
    ) {
      continue;
    }

    if (
      !isHabitAliveOnDate(
        habit,
        day
      )
    ) {
      continue;
    }

    hasActivity = true;
  }

  // =========================
  // PLAN DNIA
  // =========================

  for (
    const habit of habits
  ) {
    // =====================
    // X RAZY W TYGODNIU
    // =====================
    //
    // Nie przypisujemy
    // tygodniowego celu do
    // konkretnego dnia.
    //
    // Jeżeli użytkownik wykonał
    // taki nawyk tego dnia,
    // traktujemy go jako
    // wykonane 1/1 dla heatmapy.
    // =====================

    if (
      habit.frequency
        .type ===
      "timesPerWeek"
    ) {
      if (
        !isHabitAliveOnDate(
          habit,
          day
        )
      ) {
        continue;
      }

      if (
        hasCompletedEntry(
          entries,
          habit.id,
          day
        )
      ) {
        expected += 1;

        completed += 1;
      }

      continue;
    }

    // =====================
    // NORMALNY PLAN DNIA
    // =====================

    if (
      !isScheduledDay(
        habit,
        day
      )
    ) {
      continue;
    }

    expected += 1;

    if (
      hasCompletedEntry(
        entries,
        habit.id,
        day
      )
    ) {
      completed += 1;
    }
  }

  const successRate =
    expected > 0
      ? Math.min(
          100,
          Math.round(
            (completed /
              expected) *
              100
          )
        )
      : 0;

  return {
    date: day,

    dateKey,

    expected,

    completed,

    successRate,

    hasActivity,
  };
}

// =========================
// TREND
// =========================

export function calculateProgressChange(
  current: number,
  previous: number
) {
  if (
    current === 0 &&
    previous === 0
  ) {
    return 0;
  }

  if (
    previous === 0
  ) {
    return current > 0
      ? 100
      : 0;
  }

  return Math.round(
    ((current -
      previous) /
      previous) *
      100
  );
}