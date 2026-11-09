import {
  createContext,
  ReactNode,
  useContext,
} from "react";

import { usePersistentList } from "../hooks/usePersistentList";

// =========================
// STORAGE
// =========================

export const ROUTINE_ENTRIES_STORAGE_KEY =
  "@habits/routine-entries";

// Jeden wpis na czynność i dzień (usuwa duplikaty).
function normalizeRoutineEntries(items: unknown[]) {
  const byKey = new Map<string, RoutineEntry>();

  for (const entry of items as RoutineEntry[]) {
    byKey.set(
      JSON.stringify([entry.routineId, entry.date, entry.scope === "routine" ? null : entry.stepId]),
      entry
    );
  }

  return Array.from(byKey.values());
}

// =========================
// WPIS CZYNNOŚCI RUTYNY
// =========================

export type RoutineEntry = {
  routineId: string;

  stepId: string;

  date: string;

  completed: boolean;
  skipped?: boolean;
  scope?: "routine";
};

// =========================
// CONTEXT TYPE
// =========================

type RoutineEntriesContextType = {
  entries: RoutineEntry[];

  isLoading: boolean;

  loadFailed: boolean;

  reload: () => Promise<void>;

  isStepCompleted: (
    routineId: string,
    stepId: string,
    date: string
  ) => boolean;

  toggleStep: (
    routineId: string,
    stepId: string,
    date: string
  ) => void;

  isRoutineSkipped: (routineId: string, date: string) => boolean;
  isStepSkipped: (routineId: string, stepId: string, date: string) => boolean;
  setRoutineSkipped: (routineId: string, date: string, skipped: boolean) => void;
  setStepSkipped: (routineId: string, stepId: string, date: string, skipped: boolean) => void;

  getRoutineCompletedCount: (
    routineId: string,
    date: string
  ) => number;

  removeEntriesForRoutine: (
    routineId: string
  ) => void;
};

// =========================
// CONTEXT
// =========================

const RoutineEntriesContext =
  createContext<
    RoutineEntriesContextType | undefined
  >(undefined);

// =========================
// PROVIDER PROPS
// =========================

type RoutineEntriesProviderProps = {
  children: ReactNode;
};

// =========================
// PROVIDER
// =========================

export function RoutineEntriesProvider({
  children,
}: RoutineEntriesProviderProps) {
  const {
    items: entries,
    setItems: setEntries,
    isLoading,
    loadFailed,
    reload,
  } = usePersistentList<RoutineEntry>(
    ROUTINE_ENTRIES_STORAGE_KEY,
    normalizeRoutineEntries
  );

  // =========================
  // CZY CZYNNOŚĆ WYKONANA
  // =========================

  const isStepCompleted = (
    routineId: string,
    stepId: string,
    date: string
  ) => {
    return entries.some(
      (entry) =>
        entry.routineId === routineId &&
        entry.scope !== "routine" &&
        entry.stepId === stepId &&
        entry.date === date &&
        entry.completed && !entry.skipped
    );
  };

  // =========================
  // TOGGLE CZYNNOŚCI
  // =========================

  const toggleStep = (
    routineId: string,
    stepId: string,
    date: string
  ) => {
    setEntries((currentEntries) => {
      const existingIndex =
        currentEntries.findIndex(
          (entry) =>
            entry.routineId === routineId &&
            entry.scope !== "routine" &&
            entry.stepId === stepId &&
            entry.date === date
        );

      // Nie było jeszcze wpisu.
      if (existingIndex === -1) {
        return [
          ...currentEntries,
          {
            routineId,
            stepId,
            date,
            completed: true,
          },
        ];
      }

      // Wpis już istnieje.
      return currentEntries.map(
        (entry, index) =>
          index === existingIndex
            ? {
                ...entry,
                completed:
                  !entry.completed,
                skipped: false,
              }
            : entry
      );
    });
  };

  const isRoutineSkipped = (routineId: string, date: string) =>
    entries.some((entry) => entry.routineId === routineId && entry.date === date &&
      entry.scope === "routine" && entry.skipped);

  const isStepSkipped = (routineId: string, stepId: string, date: string) =>
    entries.some((entry) => entry.routineId === routineId && entry.date === date &&
      entry.scope !== "routine" && entry.stepId === stepId && entry.skipped);

  const setSkip = (routineId: string, stepId: string, date: string, skipped: boolean, whole: boolean) => {
    setEntries((current) => {
      const matches = (entry: RoutineEntry) => entry.routineId === routineId &&
        entry.date === date && (whole ? entry.scope === "routine" :
          entry.scope !== "routine" && entry.stepId === stepId);
      if (!skipped) return current.filter((entry) => !matches(entry));
      const existing = current.find(matches);
      const updated: RoutineEntry = { routineId, stepId, date, completed: false, skipped: true,
        ...(whole ? { scope: "routine" } : {}) };
      return existing ? current.map((entry) => matches(entry) ? updated : entry) : [...current, updated];
    });
  };
  const setRoutineSkipped = (routineId: string, date: string, skipped: boolean) =>
    setSkip(routineId, "", date, skipped, true);
  const setStepSkipped = (routineId: string, stepId: string, date: string, skipped: boolean) =>
    setSkip(routineId, stepId, date, skipped, false);

  // =========================
  // LICZBA WYKONANYCH
  // =========================

  const getRoutineCompletedCount = (
    routineId: string,
    date: string
  ) => {
    return entries.filter(
      (entry) =>
        entry.routineId === routineId &&
        entry.scope !== "routine" &&
        entry.date === date &&
        entry.completed && !entry.skipped
    ).length;
  };

  // =========================
  // USUWANIE HISTORII RUTYNY
  // =========================

  const removeEntriesForRoutine = (
    routineId: string
  ) => {
    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) =>
          entry.routineId !== routineId
      )
    );
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <RoutineEntriesContext.Provider
      value={{
        entries,

        isLoading,
        loadFailed,
        reload,

        isStepCompleted,

        toggleStep,
        isRoutineSkipped,
        isStepSkipped,
        setRoutineSkipped,
        setStepSkipped,

        getRoutineCompletedCount,

        removeEntriesForRoutine,
      }}
    >
      {children}
    </RoutineEntriesContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useRoutineEntries() {
  const context = useContext(
    RoutineEntriesContext
  );

  if (!context) {
    throw new Error(
      "useRoutineEntries musi być używany wewnątrz RoutineEntriesProvider"
    );
  }

  return context;
}