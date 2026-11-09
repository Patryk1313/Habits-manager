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

  /** Pominięcie nie jest wykonaniem i nie obniża statystyk. */
  skipped?: boolean;

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

  /**
   * Moment oznaczenia nawyku jako wykonany (ISO).
   * null / brak = niewykonany lub wpis sprzed wprowadzenia tego pola.
   */
  completedAt?: string | null;

  createdAt: string;

  updatedAt: string;
};