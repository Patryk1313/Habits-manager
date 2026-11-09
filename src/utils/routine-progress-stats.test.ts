import assert from "node:assert/strict";
import { test } from "node:test";
import type { Routine } from "../types/routine";
import type { RoutineEntry } from "../context/RoutineEntriesContext";
import { calculateRoutineDailyProgressStats } from "./routine-progress-stats";
import { getRoutineDayStatus } from "./routine-status";

const routine: Routine = {
  id: "routine", name: "Rutyna", createdAt: "2025-01-01T10:00:00",
  timeOfDay: "morning", frequency: { type: "daily" },
  steps: [{ id: "a", name: "A", order: 0 }, { id: "b", name: "B", order: 1 }],
  icon: "", color: "#000000", archived: false,
};
const date = new Date(2025, 0, 3);
const day = "2025-01-03";
const completed: RoutineEntry = { routineId: "routine", stepId: "a", date: day, completed: true };
const skipped: RoutineEntry = { routineId: "routine", stepId: "b", date: day, completed: false, skipped: true };
const whole: RoutineEntry = { routineId: "routine", stepId: "", date: day, completed: false, skipped: true, scope: "routine" };

test("pominięta czynność nie obniża statystyk rutyny", () => {
  const stats = calculateRoutineDailyProgressStats([routine], [completed, skipped], date);
  assert.deepEqual([stats.expected, stats.completed, stats.scheduledRoutines, stats.completedRoutines, stats.successRate], [1, 1, 1, 1, 100]);
  assert.deepEqual(getRoutineDayStatus(routine, [completed, skipped], day), { skipped: false, expected: 1, completed: 1, isCompleted: true });
});

test("pominięcie całej rutyny wyłącza ją ze statystyk bez usuwania czynności", () => {
  const stats = calculateRoutineDailyProgressStats([routine], [completed, skipped, whole], date);
  assert.deepEqual([stats.expected, stats.completed, stats.scheduledRoutines, stats.completedRoutines], [0, 0, 0, 0]);
  const restored = calculateRoutineDailyProgressStats([routine], [completed, skipped], date);
  assert.deepEqual([restored.expected, restored.completed], [1, 1]);
});

test("wszystkie pominięte czynności nie tworzą ukończonej rutyny", () => {
  const allSkipped = [{ ...completed, completed: false, skipped: true }, skipped];
  const stats = calculateRoutineDailyProgressStats([routine], allSkipped, date);
  assert.deepEqual([stats.expected, stats.completed, stats.scheduledRoutines, stats.completedRoutines], [0, 0, 0, 0]);
});
