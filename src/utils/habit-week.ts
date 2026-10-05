import { HabitEntry } from "../types/habit-entry";

// =========================
// DATE → YYYY-MM-DD
// =========================

function getDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================
// POCZĄTEK TYGODNIA
// PONIEDZIAŁEK
// =========================

export function getWeekStart(
  date: Date
) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() + difference
  );

  return result;
}

// =========================
// KONIEC TYGODNIA
// NIEDZIELA
// =========================

export function getWeekEnd(
  date: Date
) {
  const start =
    getWeekStart(date);

  const end = new Date(start);

  end.setDate(
    start.getDate() + 6
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return end;
}

// =========================
// WPISY NAWYKU Z TYGODNIA
// =========================

export function getHabitEntriesForWeek(
  entries: HabitEntry[],
  habitId: string,
  date: Date
) {
  const weekStart =
    getDateKey(
      getWeekStart(date)
    );

  const weekEnd =
    getDateKey(
      getWeekEnd(date)
    );
  const throughDate = getDateKey(date);

  return entries.filter(
    (entry) =>
      entry.habitId === habitId &&
      entry.completed &&
      entry.date >= weekStart &&
      entry.date <= weekEnd &&
      entry.date <= throughDate
  );
}

// =========================
// LICZBA WYKONAŃ
// =========================

export function getHabitWeeklyCount(
  entries: HabitEntry[],
  habitId: string,
  date: Date
) {
  return getHabitEntriesForWeek(
    entries,
    habitId,
    date
  ).length;
}