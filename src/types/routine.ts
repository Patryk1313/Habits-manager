export type RoutineTimeOfDay =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "anytime";

// =========================
// CZĘSTOTLIWOŚĆ RUTYNY
// =========================

export type RoutineFrequency =
  | {
      type: "daily";
    }
  | {
      type: "selectedDays";
      selectedDays: number[];
    };

// =========================
// CZYNNOŚĆ RUTYNY
// =========================

export type RoutineStep = {
  // =========================
  // IDENTYFIKACJA
  // =========================

  id: string;

  // =========================
  // NAZWA CZYNNOŚCI
  // =========================

  name: string;

  // =========================
  // KOLEJNOŚĆ
  // =========================

  order: number;
};

export type RoutineRevision = {
  effectiveFrom: string;
  effectiveTo: string;
  frequency: RoutineFrequency;
  steps: RoutineStep[];
  archived: boolean;
};

// =========================
// RUTYNA
// =========================

export type Routine = {
  // =========================
  // IDENTYFIKACJA
  // =========================

  id: string;

  createdAt: string;

  // =========================
  // PODSTAWOWE DANE
  // =========================

  name: string;

  // =========================
  // PLAN
  // =========================

  timeOfDay: RoutineTimeOfDay;

  frequency: RoutineFrequency;

  // =========================
  // CZYNNOŚCI
  // =========================

  steps: RoutineStep[];

  // =========================
  // WYGLĄD
  // =========================

  icon: string;

  color: string;

  // =========================
  // STATUS
  // =========================

  archived: boolean;

  archivedAt?: string | null;

  effectiveFrom?: string;

  history?: RoutineRevision[];
};