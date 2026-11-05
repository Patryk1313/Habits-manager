import type { HabitColor } from "../constants/habit-colors";
import type { HabitUnit } from "../constants/habit-units";
import type { HabitIconName } from "../components/HabitIcon";
import type { LegacyHabitIcon } from "./legacy-habit-icon";

import type { HabitFrequency } from "../components/FrequencyPicker";
import type { HabitTimeOfDay } from "../components/TimeOfDayPicker";
import type { HabitReminder } from "../components/ReminderPicker";

export type HabitType =
  | "boolean"
  | "quantity";

export type HabitCategory =
  | "Codzienne"
  | "Zdrowie"
  | "Rozwój";

export type HabitRevision = {
  // Zakres dat (YYYY-MM-DD, włącznie), w którym obowiązywała ta częstotliwość.
  effectiveFrom: string;

  effectiveTo: string;

  frequency: HabitFrequency;
};

export type HabitInactivePeriod = {
  // Zakres dat (YYYY-MM-DD, włącznie), w którym nawyk był zarchiwizowany.
  from: string;

  to: string;
};

export type Habit = {
  // =========================
  // IDENTYFIKACJA
  // =========================

  id: string;

  createdAt: string;

  // =========================
  // PODSTAWOWE DANE
  // =========================

  name: string;

  category: HabitCategory;

  type: HabitType;

  // =========================
  // CEL
  // =========================

  targetValue: number | null;

  unit: HabitUnit | null;

  // =========================
  // PLAN
  // =========================

  frequency: HabitFrequency;

  timeOfDay: HabitTimeOfDay;

  reminder: HabitReminder;

  // =========================
  // WYGLĄD
  // =========================

  icon: HabitIconName | LegacyHabitIcon | string;

  color: HabitColor;

  // =========================
  // STATUS
  // =========================

  archived: boolean;

  // Data archiwizacji.
  //
  // null = nawyk jest aktywny.
  //
  // Dzięki temu statystyki wiedzą,
  // do którego dnia nawyk powinien
  // być uwzględniany w planie.
  archivedAt: string | null;

  // =========================
  // HISTORIA PLANU
  // =========================

  // Od kiedy obowiązuje aktualna częstotliwość (YYYY-MM-DD).
  effectiveFrom?: string;

  // Poprzednie częstotliwości, aby zmiana planu nie przepisywała przeszłości.
  history?: HabitRevision[];

  // Okresy archiwizacji zakończone przywróceniem nawyku.
  inactivePeriods?: HabitInactivePeriod[];
};
