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
      `${entry.routineId}|${entry.stepId}|${entry.date}`,
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
        entry.stepId === stepId &&
        entry.date === date &&
        entry.completed
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
              }
            : entry
      );
    });
  };

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
        entry.date === date &&
        entry.completed
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