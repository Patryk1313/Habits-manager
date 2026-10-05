export type HabitEntry = {
  // =========================
  // IDENTYFIKACJA
  // =========================

  id: string;

  habitId: string;

  // =========================
  // DATA
  // =========================

  /**
   * Lokalny dzień w formacie:
   * YYYY-MM-DD
   *
   * np.
   * 2026-09-29
   */
  date: string;

  // =========================
  // WYKONANIE
  // =========================

  completed: boolean;

  /**
   * Wartość używana przez nawyki
   * typu "quantity".
   *
   * Przykład:
   * Kreatyna → 20 g
   *
   * Dla zwykłego Tak/Nie:
   * null
   */
  value: number | null;

  // =========================
  // CZAS
  // =========================

  createdAt: string;

  updatedAt: string;
};