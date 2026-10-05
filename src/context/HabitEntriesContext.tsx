import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { HabitEntry } from "../types/habit-entry";

// =========================
// ASYNC STORAGE
// =========================

const HABIT_ENTRIES_STORAGE_KEY =
  "@habits/habit-entries";

// =========================
// TYP CONTEXTU
// =========================

type HabitEntriesContextType = {
  entries: HabitEntry[];

  isLoading: boolean;

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

// =========================
// CONTEXT
// =========================

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
  const [entries, setEntries] = useState<
    HabitEntry[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  // =========================
  // WCZYTANIE HISTORII
  // =========================

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const storedEntries =
          await AsyncStorage.getItem(
            HABIT_ENTRIES_STORAGE_KEY
          );

        if (storedEntries) {
          const parsedEntries: HabitEntry[] =
            JSON.parse(storedEntries);

          setEntries(parsedEntries);
        }
      } catch (error) {
        console.error(
          "Błąd podczas wczytywania historii nawyków:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // =========================
  // AUTOMATYCZNY ZAPIS
  // =========================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const saveEntries = async () => {
      try {
        await AsyncStorage.setItem(
          HABIT_ENTRIES_STORAGE_KEY,
          JSON.stringify(entries)
        );
      } catch (error) {
        console.error(
          "Błąd podczas zapisywania historii nawyków:",
          error
        );
      }
    };

    saveEntries();
  }, [entries, isLoading]);

  // =========================
  // POBIERANIE WPISU
  // =========================

  const getEntry = (
    habitId: string,
    date: string
  ) => {
    return entries.find(
      (entry) =>
        entry.habitId === habitId &&
        entry.date === date
    );
  };

  // =========================
  // CZY NAWYK WYKONANY?
  // =========================

  const isHabitCompleted = (
    habitId: string,
    date: string
  ) => {
    const entry = getEntry(
      habitId,
      date
    );

    return entry?.completed ?? false;
  };

  // =========================
  // USTAWIENIE STATUSU
  // =========================

  const setHabitCompleted = (
    habitId: string,
    date: string,
    completed: boolean,
    value: number | null = null
  ) => {
    setEntries((currentEntries) => {
      const existingEntry =
        currentEntries.find(
          (entry) =>
            entry.habitId ===
              habitId &&
            entry.date === date
        );

      const now =
        new Date().toISOString();

      // =====================
      // WPIS JUŻ ISTNIEJE
      // =====================

      if (existingEntry) {
        return currentEntries.map(
          (entry) =>
            entry.id ===
            existingEntry.id
              ? {
                  ...entry,

                  completed,

                  value,

                  updatedAt: now,
                }
              : entry
        );
      }

      // =====================
      // NOWY WPIS
      // =====================

      const newEntry: HabitEntry = {
        id: `${habitId}-${date}-${Date.now()}`,

        habitId,

        date,

        completed,

        value,

        createdAt: now,

        updatedAt: now,
      };

      return [
        ...currentEntries,
        newEntry,
      ];
    });
  };

  // =========================
  // TOGGLE
  // =========================

  const toggleHabit = (
    habitId: string,
    date: string,
    value: number | null = null
  ) => {
    setEntries((currentEntries) => {
      const existingEntry =
        currentEntries.find(
          (entry) =>
            entry.habitId ===
              habitId &&
            entry.date === date
        );

      const now =
        new Date().toISOString();

      // =====================
      // WPIS ISTNIEJE
      // =====================

      if (existingEntry) {
        return currentEntries.map(
          (entry) =>
            entry.id ===
            existingEntry.id
              ? {
                  ...entry,

                  completed:
                    !entry.completed,

                  value:
                    !entry.completed
                      ? value
                      : null,

                  updatedAt: now,
                }
              : entry
        );
      }

      // =====================
      // PIERWSZE WYKONANIE
      // =====================

      const newEntry: HabitEntry = {
        id: `${habitId}-${date}-${Date.now()}`,

        habitId,

        date,

        completed: true,

        value,

        createdAt: now,

        updatedAt: now,
      };

      return [
        ...currentEntries,
        newEntry,
      ];
    });
  };

  // =========================
  // USUWANIE WPISU
  // =========================

  const removeEntry = (
    habitId: string,
    date: string
  ) => {
    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) =>
          !(
            entry.habitId ===
              habitId &&
            entry.date === date
          )
      )
    );
  };

  // =========================
  // USUWANIE HISTORII NAWYKU
  // =========================

  const removeEntriesForHabit = (
    habitId: string
  ) => {
    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) =>
          entry.habitId !== habitId
      )
    );
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <HabitEntriesContext.Provider
      value={{
        entries,

        isLoading,

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