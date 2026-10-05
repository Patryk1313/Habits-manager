import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";

import { Habit } from "../types/habit";
import { syncHabitNotifications } from "../utils/habit-notifications";

// =========================
// ASYNC STORAGE
// =========================

const HABITS_STORAGE_KEY =
  "@habits/habits";

// =========================
// TYP CONTEXTU
// =========================

type HabitsContextType = {
  habits: Habit[];

  isLoading: boolean;

  addHabit: (
    habit: Habit
  ) => void;

  updateHabit: (
    habit: Habit
  ) => void;

  removeHabit: (
    id: string
  ) => void;

  archiveHabit: (
    id: string
  ) => void;

  restoreHabit: (
    id: string
  ) => void;
};

// =========================
// CONTEXT
// =========================

const HabitsContext =
  createContext<
    HabitsContextType | undefined
  >(undefined);

// =========================
// PROPS
// =========================

type HabitsProviderProps = {
  children: ReactNode;
};

// =========================
// PROVIDER
// =========================

export function HabitsProvider({
  children,
}: HabitsProviderProps) {
  const [
    habits,
    setHabits,
  ] = useState<Habit[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // =========================
  // WCZYTANIE NAWYKÓW
  // =========================

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storedHabits =
          await AsyncStorage.getItem(
            HABITS_STORAGE_KEY
          );

        if (storedHabits) {
          const parsedHabits =
            JSON.parse(
              storedHabits
            ) as Partial<Habit>[];

          // =====================
          // MIGRACJA STARYCH NAWYKÓW
          // =====================
          //
          // Starsze zapisane nawyki mogą
          // nie posiadać:
          //
          // archived
          // archivedAt
          //
          // Brak archived oznacza,
          // że nawyk jest aktywny.
          //
          // Brak archivedAt oznacza,
          // że nie znamy historycznej
          // daty archiwizacji.
          // =====================

          const migratedHabits =
            parsedHabits.map(
              (habit) => ({
                ...habit,

                archived:
                  habit.archived ??
                  false,

                archivedAt:
                  habit.archivedAt ??
                  null,
              })
            ) as Habit[];

          setHabits(
            migratedHabits
          );
        }
      } catch (error) {
        console.error(
          "Błąd podczas wczytywania nawyków:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadHabits();
  }, []);

  // =========================
  // AUTOMATYCZNY ZAPIS
  // =========================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem(
          HABITS_STORAGE_KEY,
          JSON.stringify(habits)
        );
      } catch (error) {
        console.error(
          "Błąd podczas zapisywania nawyków:",
          error
        );
      }
    };

    saveHabits();
  }, [
    habits,
    isLoading,
  ]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    void syncHabitNotifications(habits);
    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          void syncHabitNotifications(habits);
        }
      }
    );

    return () => subscription.remove();
  }, [habits, isLoading]);

  // =========================
  // DODAWANIE NAWYKU
  // =========================

  const addHabit = (
    habit: Habit
  ) => {
    const newHabit: Habit = {
      ...habit,

      archived:
        habit.archived ??
        false,

      archivedAt:
        habit.archived
          ? habit.archivedAt ??
            new Date().toISOString()
          : null,
    };

    setHabits(
      (currentHabits) => [
        ...currentHabits,
        newHabit,
      ]
    );
  };

  // =========================
  // AKTUALIZACJA NAWYKU
  // =========================

  const updateHabit = (
    updatedHabit: Habit
  ) => {
    setHabits(
      (currentHabits) =>
        currentHabits.map(
          (habit) =>
            habit.id ===
            updatedHabit.id
              ? updatedHabit
              : habit
        )
    );
  };

  // =========================
  // ARCHIWIZACJA NAWYKU
  // =========================

  const archiveHabit = (
    id: string
  ) => {
    const archivedAt =
      new Date().toISOString();

    setHabits(
      (currentHabits) =>
        currentHabits.map(
          (habit) =>
            habit.id === id
              ? {
                  ...habit,

                  archived: true,

                  archivedAt,
                }
              : habit
        )
    );
  };

  // =========================
  // PRZYWRACANIE NAWYKU
  // =========================

  const restoreHabit = (
    id: string
  ) => {
    setHabits(
      (currentHabits) =>
        currentHabits.map(
          (habit) =>
            habit.id === id
              ? {
                  ...habit,

                  archived: false,

                  archivedAt: null,
                }
              : habit
        )
    );
  };

  // =========================
  // USUWANIE NAWYKU
  // =========================

  const removeHabit = (
    id: string
  ) => {
    setHabits(
      (currentHabits) =>
        currentHabits.filter(
          (habit) =>
            habit.id !== id
        )
    );
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <HabitsContext.Provider
      value={{
        habits,

        isLoading,

        addHabit,

        updateHabit,

        removeHabit,

        archiveHabit,

        restoreHabit,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useHabits() {
  const context =
    useContext(
      HabitsContext
    );

  if (!context) {
    throw new Error(
      "useHabits musi być używany wewnątrz HabitsProvider"
    );
  }

  return context;
}