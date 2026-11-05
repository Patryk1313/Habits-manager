import {
  createContext,
  ReactNode,
  useContext,
} from "react";

import { usePersistentList } from "../hooks/usePersistentList";
import { Routine, RoutineRevision } from "../types/routine";

// =========================
// ASYNC STORAGE
// =========================

export const ROUTINES_STORAGE_KEY =
  "@habits/routines";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToDateKey(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

function normalizeRoutines(items: unknown[]): Routine[] {
  return (items as Routine[]).map(normalizeRoutine);
}

function normalizeRoutine(routine: Routine): Routine {
  const archived = routine.archived ?? false;
  const archivedAt =
    routine.archivedAt ??
    (archived ? new Date().toISOString() : null);

  return {
    ...routine,
    archived,
    archivedAt,
    effectiveFrom:
      routine.effectiveFrom ??
      (archived && archivedAt
        ? addDaysToDateKey(getDateKey(new Date(archivedAt)), 1)
        : getDateKey(new Date(routine.createdAt))),
    history: routine.history ?? [],
  };
}

function createRoutineRevision(
  routine: Routine,
  effectiveFrom: string,
  effectiveTo: string,
  archived = routine.archived
): RoutineRevision {
  return {
    effectiveFrom,
    effectiveTo,
    frequency:
      routine.frequency.type === "daily"
        ? { type: "daily" }
        : {
            type: "selectedDays",
            selectedDays: [...routine.frequency.selectedDays],
          },
    steps: routine.steps.map((step) => ({ ...step })),
    archived,
  };
}

function appendRoutineRevision(
  history: RoutineRevision[],
  routine: Routine,
  effectiveFrom: string,
  effectiveTo: string,
  archived = routine.archived
) {
  if (effectiveFrom > effectiveTo) {
    return history;
  }

  return [
    ...history,
    createRoutineRevision(
      routine,
      effectiveFrom,
      effectiveTo,
      archived
    ),
  ];
}

// =========================
// TYP CONTEXTU
// =========================

type RoutinesContextType = {
  routines: Routine[];

  isLoading: boolean;

  loadFailed: boolean;

  reload: () => Promise<void>;

  addRoutine: (
    routine: Routine
  ) => void;

  updateRoutine: (
    routine: Routine
  ) => void;

  removeRoutine: (
    id: string
  ) => void;

  archiveRoutine: (
    id: string
  ) => void;

  restoreRoutine: (
    id: string
  ) => void;
};

// =========================
// CONTEXT
// =========================

const RoutinesContext =
  createContext<
    RoutinesContextType | undefined
  >(undefined);

// =========================
// PROPS
// =========================

type RoutinesProviderProps = {
  children: ReactNode;
};

// =========================
// PROVIDER
// =========================

export function RoutinesProvider({
  children,
}: RoutinesProviderProps) {
  const {
    items: routines,
    setItems: setRoutines,
    isLoading,
    loadFailed,
    reload,
  } = usePersistentList<Routine>(
    ROUTINES_STORAGE_KEY,
    normalizeRoutines
  );

  // =========================
  // DODAWANIE
  // =========================

  const addRoutine = (
    routine: Routine
  ) => {
    setRoutines(
      (currentRoutines) => [
        ...currentRoutines,
        normalizeRoutine(routine),
      ]
    );
  };

  // =========================
  // EDYCJA
  // =========================

  const updateRoutine = (
    updatedRoutine: Routine
  ) => {
    setRoutines((currentRoutines) =>
      currentRoutines.map((routine) => {
        if (routine.id !== updatedRoutine.id) {
          return routine;
        }

        const todayKey = getDateKey(new Date());
        const effectiveFrom =
          routine.effectiveFrom ??
          getDateKey(new Date(routine.createdAt));
        const scheduleChanged =
          JSON.stringify(routine.frequency) !==
            JSON.stringify(updatedRoutine.frequency) ||
          JSON.stringify(routine.steps) !==
            JSON.stringify(updatedRoutine.steps);
        const closePreviousVersion =
          scheduleChanged && effectiveFrom < todayKey;
        const history = closePreviousVersion
          ? appendRoutineRevision(
              routine.history ?? [],
              routine,
              effectiveFrom,
              addDaysToDateKey(todayKey, -1)
            )
          : routine.history ?? [];

        return {
          ...updatedRoutine,
          history,
          effectiveFrom: closePreviousVersion
            ? todayKey
            : effectiveFrom,
          archivedAt: routine.archivedAt ?? null,
        };
      })
    );
  };

  // =========================
  // USUWANIE
  // =========================

  const removeRoutine = (
    id: string
  ) => {
    setRoutines(
      (currentRoutines) =>
        currentRoutines.filter(
          (routine) =>
            routine.id !== id
        )
    );
  };

  // =========================
  // ARCHIWIZACJA
  // =========================

  const archiveRoutine = (
    id: string
  ) => {
    setRoutines((currentRoutines) =>
      currentRoutines.map((routine) => {
        if (routine.id !== id || routine.archived) {
          return routine;
        }

        const todayKey = getDateKey(new Date());
        const effectiveFrom =
          routine.effectiveFrom ??
          getDateKey(new Date(routine.createdAt));

        return {
          ...routine,
          archived: true,
          archivedAt: new Date().toISOString(),
          effectiveFrom: addDaysToDateKey(todayKey, 1),
          history: appendRoutineRevision(
            routine.history ?? [],
            routine,
            effectiveFrom,
            todayKey,
            false
          ),
        };
      })
    );
  };

  // =========================
  // PRZYWRACANIE
  // =========================

  const restoreRoutine = (
    id: string
  ) => {
    setRoutines((currentRoutines) =>
      currentRoutines.map((routine) => {
        if (routine.id !== id || !routine.archived) {
          return routine;
        }

        const todayKey = getDateKey(new Date());
        const effectiveFrom =
          routine.effectiveFrom ??
          getDateKey(new Date(routine.createdAt));

        return {
          ...routine,
          archived: false,
          archivedAt: null,
          effectiveFrom: todayKey,
          history: appendRoutineRevision(
            routine.history ?? [],
            routine,
            effectiveFrom,
            addDaysToDateKey(todayKey, -1),
            true
          ),
        };
      })
    );
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <RoutinesContext.Provider
      value={{
        routines,

        isLoading,
        loadFailed,
        reload,

        addRoutine,

        updateRoutine,

        removeRoutine,

        archiveRoutine,

        restoreRoutine,
      }}
    >
      {children}
    </RoutinesContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useRoutines() {
  const context =
    useContext(
      RoutinesContext
    );

  if (!context) {
    throw new Error(
      "useRoutines musi być używany wewnątrz RoutinesProvider"
    );
  }

  return context;
}