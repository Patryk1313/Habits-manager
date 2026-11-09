import type { Routine } from "../types/routine";
import type { RoutineEntry } from "../context/RoutineEntriesContext";
import {
  eachDay,
  getDateKey,
  parseDateTime,
  type ProgressRange,
} from "./progress-stats";

export type RoutineDailyProgressStats = {
  date: Date;
  dateKey: string;
  expected: number;
  completed: number;
  successRate: number;
  hasActivity: boolean;
  scheduledRoutines: number;
  completedRoutines: number;
};

export type RoutineProgressStats = {
  expected: number;
  completed: number;
  successRate: number;
  activeDays: number;
  scheduledRoutines: number;
  completedRoutines: number;
};

function getRoutineVersionForDate(
  routine: Routine,
  dateKey: string
) {
  const createdDateKey = getDateKey(parseDateTime(routine.createdAt));
  if (dateKey < createdDateKey) {
    return null;
  }

  const revision = routine.history?.find(
    (item) =>
      item.effectiveFrom <= dateKey &&
      dateKey <= item.effectiveTo
  );
  if (revision) {
    return revision;
  }

  const effectiveFrom =
    routine.effectiveFrom ?? createdDateKey;
  if (dateKey < effectiveFrom) {
    // Older archived records have no recorded archive date history.
    // Preserve their current definition through the migrated archive day.
    if (
      routine.archived &&
      routine.archivedAt &&
      dateKey <= getDateKey(new Date(routine.archivedAt))
    ) {
      return {
        frequency: routine.frequency,
        steps: routine.steps,
        archived: false,
      };
    }
    return null;
  }

  return {
    frequency: routine.frequency,
    steps: routine.steps,
    archived: routine.archived,
  };
}

function isScheduledForDate(
  routine: Routine,
  date: Date,
  dateKey: string
) {
  const version = getRoutineVersionForDate(routine, dateKey);
  if (!version || version.archived || version.steps.length === 0) {
    return null;
  }

  const scheduled =
    version.frequency.type === "daily" ||
    version.frequency.selectedDays.includes(date.getDay());

  return scheduled ? version : null;
}

export function calculateRoutineDailyProgressStats(
  routines: Routine[],
  entries: RoutineEntry[],
  date: Date
): RoutineDailyProgressStats {
  const dateKey = getDateKey(date);
  let expected = 0;
  let completed = 0;
  let scheduledRoutines = 0;
  let completedRoutines = 0;

  for (const routine of routines) {
    const version = isScheduledForDate(routine, date, dateKey);
    if (!version) {
      continue;
    }

    const dayEntries = entries.filter((entry) =>
      entry.routineId === routine.id && entry.date === dateKey
    );
    if (dayEntries.some((entry) => entry.scope === "routine" && entry.skipped)) {
      continue;
    }
    const skippedStepIds = new Set(dayEntries.filter((entry) =>
      entry.scope !== "routine" && entry.skipped
    ).map((entry) => entry.stepId));
    const expectedSteps = version.steps.filter((step) => !skippedStepIds.has(step.id));
    if (expectedSteps.length === 0) continue;
    scheduledRoutines += 1;
    expected += expectedSteps.length;

    const completedStepIds = new Set(
      dayEntries
        .filter(
          (entry) =>
            entry.routineId === routine.id &&
            entry.date === dateKey &&
            entry.completed && !entry.skipped && entry.scope !== "routine"
        )
        .map((entry) => entry.stepId)
    );
    const completedStepCount = expectedSteps.filter((step) =>
      completedStepIds.has(step.id)
    ).length;

    completed += completedStepCount;
    if (completedStepCount === expectedSteps.length) {
      completedRoutines += 1;
    }
  }

  return {
    date,
    dateKey,
    expected,
    completed,
    successRate:
      expected > 0
        ? Math.round((completed / expected) * 100)
        : 0,
    hasActivity: completed > 0,
    scheduledRoutines,
    completedRoutines,
  };
}

export function calculateRoutineProgressStats(
  routines: Routine[],
  entries: RoutineEntry[],
  range: ProgressRange
): RoutineProgressStats {
  let expected = 0;
  let completed = 0;
  let scheduledRoutines = 0;
  let completedRoutines = 0;
  const activeDates = new Set<string>();

  for (const date of eachDay(range.start, range.end)) {
    const daily = calculateRoutineDailyProgressStats(
      routines,
      entries,
      date
    );

    expected += daily.expected;
    completed += daily.completed;
    scheduledRoutines += daily.scheduledRoutines;
    completedRoutines += daily.completedRoutines;
    if (daily.hasActivity) {
      activeDates.add(daily.dateKey);
    }
  }

  return {
    expected,
    completed,
    successRate:
      expected > 0
        ? Math.round((completed / expected) * 100)
        : 0,
    activeDays: activeDates.size,
    scheduledRoutines,
    completedRoutines,
  };
}