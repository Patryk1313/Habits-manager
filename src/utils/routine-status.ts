import type { Routine } from "../types/routine";
import type { RoutineEntry } from "../context/RoutineEntriesContext";

export function getRoutineDayStatus(routine: Routine, entries: RoutineEntry[], date: string) {
  const day = entries.filter((entry) => entry.routineId === routine.id && entry.date === date);
  const skipped = day.some((entry) => entry.scope === "routine" && entry.skipped);
  const skippedSteps = new Set(day.filter((entry) => entry.scope !== "routine" && entry.skipped).map((entry) => entry.stepId));
  const completedSteps = new Set(day.filter((entry) => entry.scope !== "routine" && entry.completed && !entry.skipped).map((entry) => entry.stepId));
  const expected = skipped ? 0 : routine.steps.filter((step) => !skippedSteps.has(step.id)).length;
  const completed = skipped ? 0 : routine.steps.filter((step) => !skippedSteps.has(step.id) && completedSteps.has(step.id)).length;
  return { skipped, expected, completed, isCompleted: expected > 0 && completed === expected };
}
