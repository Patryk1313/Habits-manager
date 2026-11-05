import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { AppState } from "react-native";

import { usePersistentList } from "../hooks/usePersistentList";
import { Habit } from "../types/habit";
import { addDaysToDateKey, getDateKey } from "../utils/date";
import { syncHabitNotifications } from "../utils/habit-notifications";

// =========================
// STORAGE
// =========================

export const HABITS_STORAGE_KEY =
  "@habits/habits";

// Starsze zapisy mogą nie mieć archived / archivedAt.
function normalizeHabits(items: unknown[]) {
  return (items as Partial<Habit>[]).map((habit) => ({
    ...habit,
    archived: habit.archived ?? false,
    archivedAt: habit.archivedAt ?? null,
  })) as Habit[];
}

// =========================
// HISTORIA ZMIAN
// =========================

function sameFrequency(first: Habit["frequency"], second: Habit["frequency"]) {
  return JSON.stringify(first) === JSON.stringify(second);
}

function applyFrequencyChange(current: Habit, updated: Habit): Habit {
  if (sameFrequency(current.frequency, updated.frequency)) {
    return {
      ...updated,
      history: current.history,
      effectiveFrom: current.effectiveFrom,
      inactivePeriods: current.inactivePeriods,
    };
  }

  const todayKey = getDateKey(new Date());
  const previousFrom =
    current.effectiveFrom ?? getDateKey(new Date(current.createdAt));
  const previousTo = addDaysToDateKey(todayKey, -1);
  const history = current.history ?? [];

  return {
    ...updated,
    effectiveFrom: todayKey,
    inactivePeriods: current.inactivePeriods,
    // Zmiana w tym samym dniu nie tworzy nowej wersji.
    history:
      previousFrom <= previousTo
        ? [
            ...history,
            {
              effectiveFrom: previousFrom,
              effectiveTo: previousTo,
              frequency: current.frequency,
            },
          ]
        : history,
  };
}

// =========================
// TYP CONTEXTU
// =========================

type HabitsContextType = {
  habits: Habit[];

  isLoading: boolean;

  loadFailed: boolean;

  reload: () => Promise<void>;

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

type HabitsProviderProps = {
  children: ReactNode;
};

// =========================
// PROVIDER
// =========================

export function HabitsProvider({
  children,
}: HabitsProviderProps) {
  const {
    items: habits,
    setItems: setHabits,
    isLoading,
    loadFailed,
    reload,
  } = usePersistentList<Habit>(
    HABITS_STORAGE_KEY,
    normalizeHabits
  );

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

  const addHabit = (habit: Habit) => {
    const newHabit: Habit = {
      ...habit,
      archived: habit.archived ?? false,
      archivedAt: habit.archived
        ? habit.archivedAt ?? new Date().toISOString()
        : null,
    };

    setHabits((currentHabits) => [...currentHabits, newHabit]);
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === updatedHabit.id
          ? applyFrequencyChange(habit, updatedHabit)
          : habit
      )
    );
  };

  const archiveHabit = (id: string) => {
    const archivedAt = new Date().toISOString();

    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === id
          ? { ...habit, archived: true, archivedAt }
          : habit
      )
    );
  };

  const restoreHabit = (id: string) => {
    const todayKey = getDateKey(new Date());

    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== id) {
          return habit;
        }

        // Dni od archiwizacji do przywrócenia nie należą do aktywnego okresu.
        const gapFrom = habit.archivedAt
          ? addDaysToDateKey(getDateKey(new Date(habit.archivedAt)), 1)
          : null;
        const gapTo = addDaysToDateKey(todayKey, -1);

        return {
          ...habit,
          archived: false,
          archivedAt: null,
          inactivePeriods:
            gapFrom && gapFrom <= gapTo
              ? [
                  ...(habit.inactivePeriods ?? []),
                  { from: gapFrom, to: gapTo },
                ]
              : habit.inactivePeriods,
        };
      })
    );
  };

  const removeHabit = (id: string) => {
    setHabits((currentHabits) =>
      currentHabits.filter((habit) => habit.id !== id)
    );
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        isLoading,
        loadFailed,
        reload,
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