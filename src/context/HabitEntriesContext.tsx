import {
  createContext,
  ReactNode,
  useContext,
} from "react";

import { usePersistentList } from "../hooks/usePersistentList";
import { HabitEntry } from "../types/habit-entry";

// =========================
// STORAGE
// =========================

export const HABIT_ENTRIES_STORAGE_KEY =
  "@habits/habit-entries";

// Jeden wpis na nawyk i dzień - przy duplikatach wygrywa ostatnio zmieniony.
function normalizeEntries(items: unknown[]) {
  const byKey = new Map<string, HabitEntry>();

  for (const entry of items as HabitEntry[]) {
    const key = `${entry.habitId}|${entry.date}`;
    const existing = byKey.get(key);

    if (
      !existing ||
      (entry.updatedAt ?? "") >= (existing.updatedAt ?? "")
    ) {
      byKey.set(key, entry);
    }
  }

  return Array.from(byKey.values());
}

// =========================
// TYP CONTEXTU
// =========================

type HabitEntriesContextType = {
  entries: HabitEntry[];

  isLoading: boolean;

  loadFailed: boolean;

  reload: () => Promise<void>;

  getEntry: (
    habitId: string,
    date: string
  ) => HabitEntry | undefined;

  isHabitCompleted: (
    habitId: string,
    date: string
  ) => boolean;

  toggleHabit: (
    habitId: string,
    date: string,
    value?: number | null
  ) => void;

  setHabitCompleted: (
    habitId: string,
    date: string,
    completed: boolean,
    value?: number | null
  ) => void;

  removeEntry: (
    habitId: string,
    date: string
  ) => void;

  removeEntriesForHabit: (
    habitId: string
  ) => void;
};

const HabitEntriesContext =
  createContext<
    HabitEntriesContextType | undefined
  >(undefined);

type HabitEntriesProviderProps = {
  children: ReactNode;
};

// =========================
// PROVIDER
// =========================

export function HabitEntriesProvider({
  children,
}: HabitEntriesProviderProps) {
  const {
    items: entries,
    setItems: setEntries,
    isLoading,
    loadFailed,
    reload,
  } = usePersistentList<HabitEntry>(
    HABIT_ENTRIES_STORAGE_KEY,
    normalizeEntries
  );

  const getEntry = (habitId: string, date: string) =>
    entries.find(
      (entry) =>
        entry.habitId === habitId && entry.date === date
    );

  const isHabitCompleted = (habitId: string, date: string) =>
    getEntry(habitId, date)?.completed ?? false;

  const upsertEntry = (
    habitId: string,
    date: string,
    resolveCompleted: (current: boolean) => boolean,
    value: number | null
  ) => {
    setEntries((currentEntries) => {
      const existing = currentEntries.find(
        (entry) =>
          entry.habitId === habitId && entry.date === date
      );
      const now = new Date().toISOString();
      const completed = resolveCompleted(existing?.completed ?? false);
      const patch = {
        completed,
        value: completed ? value : null,
        completedAt: completed
          ? existing?.completed
            ? existing.completedAt ?? now
            : now
          : null,
        updatedAt: now,
      };

      if (existing) {
        return currentEntries.map((entry) =>
          entry === existing ? { ...entry, ...patch } : entry
        );
      }

      return [
        ...currentEntries,
        {
          id: `${habitId}-${date}-${Date.now()}`,
          habitId,
          date,
          createdAt: now,
          ...patch,
        },
      ];
    });
  };

  const setHabitCompleted = (
    habitId: string,
    date: string,
    completed: boolean,
    value: number | null = null
  ) => {
    upsertEntry(habitId, date, () => completed, value);
  };

  const toggleHabit = (
    habitId: string,
    date: string,
    value: number | null = null
  ) => {
    upsertEntry(habitId, date, (current) => !current, value);
  };

  const removeEntry = (habitId: string, date: string) => {
    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) =>
          !(entry.habitId === habitId && entry.date === date)
      )
    );
  };

  const removeEntriesForHabit = (habitId: string) => {
    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.habitId !== habitId)
    );
  };

  return (
    <HabitEntriesContext.Provider
      value={{
        entries,
        isLoading,
        loadFailed,
        reload,
        getEntry,
        isHabitCompleted,
        toggleHabit,
        setHabitCompleted,
        removeEntry,
        removeEntriesForHabit,
      }}
    >
      {children}
    </HabitEntriesContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useHabitEntries() {
  const context = useContext(
    HabitEntriesContext
  );

  if (!context) {
    throw new Error(
      "useHabitEntries musi być używany wewnątrz HabitEntriesProvider"
    );
  }

  return context;
}