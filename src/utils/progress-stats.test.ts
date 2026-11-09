import assert from "node:assert/strict";
import { test } from "node:test";

import type { HabitFrequency } from "../components/FrequencyPicker";
import type { Habit } from "../types/habit";
import {
  calculateDailyProgressStats,
  calculateHabitBestStreak,
  calculateOnTimeStats,
  calculateProgressStats,
  getTimesPerWeekStats,
  isScheduledDay,
  parseDateKey,
} from "./progress-stats";

const daily: HabitFrequency = {
  type: "daily",
  selectedDays: [],
  timesPerWeek: 1,
  intervalDays: 1,
};

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    createdAt: "2025-01-01T08:00:00",
    name: "Test",
    frequency: daily,
    timeOfDay: { type: "morning" },
    archived: false,
    archivedAt: null,
    ...overrides,
  } as unknown as Habit;
}

const entry = (date: string, extra = {}) => ({
  habitId: "h1",
  date,
  completed: true,
  ...extra,
});

const range = (from: string, to: string) => ({
  start: parseDateKey(from),
  end: parseDateKey(to),
});

test("pominięty dzień nie jest oczekiwany ani wykonany w statystykach", () => {
  const habit = makeHabit();
  const entries = [
    entry("2025-01-01"),
    entry("2025-01-02", { completed: false, skipped: true }),
    entry("2025-01-03"),
  ];
  const stats = calculateProgressStats([habit], entries, range("2025-01-01", "2025-01-03"));
  assert.equal(stats.expected, 2);
  assert.equal(stats.completed, 2);
  assert.equal(stats.successRate, 100);
  assert.equal(calculateDailyProgressStats([habit], entries, parseDateKey("2025-01-02")).expected, 0);
  assert.equal(calculateHabitBestStreak(
    makeHabit({ archived: true, archivedAt: "2025-01-03T23:59:00" }),
    entries
  ), 2);
});

test("pominięcie zmniejsza dostępną część celu tygodniowego", () => {
  const habit = makeHabit({
    frequency: { ...daily, type: "timesPerWeek", timesPerWeek: 7 },
  });
  const entries = [
    entry("2025-01-06"),
    entry("2025-01-07", { completed: false, skipped: true }),
  ];
  const stats = getTimesPerWeekStats(habit, range("2025-01-06", "2025-01-12"), entries);
  assert.deepEqual(stats, { expected: 6, completed: 1 });
});

test("nowy nawyk nie istnieje w dniach przed utworzeniem", () => {
  const habit = makeHabit({ createdAt: "2025-01-10T09:00:00" });
  const stats = calculateProgressStats([habit], [], range("2025-01-05", "2025-01-12"));
  assert.equal(stats.expected, 3);
});

test("duplikaty wpisów liczą się jako jedno wykonanie", () => {
  const habit = makeHabit();
  const stats = calculateProgressStats(
    [habit],
    [entry("2025-01-02"), entry("2025-01-02")],
    range("2025-01-01", "2025-01-03")
  );
  assert.equal(stats.completed, 1);
  assert.equal(stats.expected, 3);
});

test("zmiana częstotliwości nie zmienia przeszłości", () => {
  const habit = makeHabit({
    frequency: { ...daily, type: "selectedDays", selectedDays: ["mon"] },
    effectiveFrom: "2025-01-06",
    history: [
      { effectiveFrom: "2025-01-01", effectiveTo: "2025-01-05", frequency: daily },
    ],
  });
  const before = calculateDailyProgressStats([habit], [], parseDateKey("2025-01-03"));
  assert.equal(before.expected, 1);
  // 2025-01-07 to wtorek, nie poniedziałek
  assert.equal(isScheduledDay(habit, parseDateKey("2025-01-07")), false);
  assert.equal(isScheduledDay(habit, parseDateKey("2025-01-06")), true);
});

test("okres po archiwizacji i przed przywróceniem jest pomijany", () => {
  const habit = makeHabit({
    inactivePeriods: [{ from: "2025-01-03", to: "2025-01-05" }],
  });
  const stats = calculateProgressStats([habit], [], range("2025-01-01", "2025-01-06"));
  assert.equal(stats.expected, 3);
});

test("cel tygodniowy liczy dzień tylko gdy wykonano", () => {
  const habit = makeHabit({
    frequency: { ...daily, type: "timesPerWeek", timesPerWeek: 3 },
  });
  const day = calculateDailyProgressStats(
    [habit],
    [entry("2025-01-02")],
    parseDateKey("2025-01-02")
  );
  assert.deepEqual([day.expected, day.completed], [1, 1]);
  const empty = calculateDailyProgressStats([habit], [], parseDateKey("2025-01-03"));
  assert.equal(empty.expected, 0);
});

test("wykonanie w porze: liczą się tylko wpisy z tego samego dnia", () => {
  const habit = makeHabit();
  const stats = calculateOnTimeStats(
    [habit],
    [
      entry("2025-01-02", { completedAt: new Date(2025, 0, 2, 9).toISOString() }),
      entry("2025-01-03", { completedAt: new Date(2025, 0, 3, 20).toISOString() }),
      entry("2025-01-04", { completedAt: new Date(2025, 0, 5, 9).toISOString() }),
      entry("2025-01-05"),
    ],
    range("2025-01-01", "2025-01-10")
  );
  assert.equal(stats.eligible, 2);
  assert.equal(stats.onTime, 1);
});
