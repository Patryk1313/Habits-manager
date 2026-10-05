import {
  HabitFrequency,
  WeekDay,
} from "../components/FrequencyPicker";

// =========================
// DATA → YYYY-MM-DD
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
// YYYY-MM-DD → LOCAL DATE
// =========================

function parseLocalDate(
  dateString: string
) {
  const [year, month, day] =
    dateString
      .slice(0, 10)
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

// =========================
// DZIEŃ TYGODNIA
// =========================

function getWeekDay(
  date: Date
): WeekDay {
  const days: WeekDay[] = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ];

  return days[date.getDay()];
}

// =========================
// RÓŻNICA DNI
// =========================

function differenceInDays(
  from: Date,
  to: Date
) {
  const fromUtc = Date.UTC(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  );

  const toUtc = Date.UTC(
    to.getFullYear(),
    to.getMonth(),
    to.getDate()
  );

  return Math.floor(
    (toUtc - fromUtc) /
      (1000 * 60 * 60 * 24)
  );
}

// =========================
// CZY NAWYK JEST ZAPLANOWANY?
// =========================

export function isHabitScheduledForDate(
  frequency: HabitFrequency,
  selectedDate: Date,
  createdAt?: string
) {
  // =========================
  // NIE POKAZUJ PRZED UTWORZENIEM
  // =========================

  let creationDate: Date | null =
    null;

  if (createdAt) {
    creationDate =
      parseLocalDate(createdAt);

    if (
      getDateKey(selectedDate) <
      getDateKey(creationDate)
    ) {
      return false;
    }
  }

  // =========================
  // CODZIENNIE
  // =========================

  if (frequency.type === "daily") {
    return true;
  }

  // =========================
  // WYBRANE DNI
  // =========================

  if (
    frequency.type ===
    "selectedDays"
  ) {
    const weekDay =
      getWeekDay(selectedDate);

    return frequency.selectedDays.includes(
      weekDay
    );
  }

  // =========================
  // X RAZY W TYGODNIU
  // =========================

  if (
    frequency.type ===
    "timesPerWeek"
  ) {
    /*
     * Tutaj nie mamy konkretnych
     * dni tygodnia.
     *
     * Np. "3× w tygodniu"
     * oznacza, że użytkownik może
     * zrobić nawyk w dowolne 3 dni.
     *
     * Dlatego pokazujemy go każdego
     * dnia tygodnia.
     */
    return true;
  }

  // =========================
  // CO X DNI
  // =========================

  if (
    frequency.type === "interval"
  ) {
    /*
     * Interwał musi mieć punkt
     * początkowy.
     *
     * Używamy dnia utworzenia nawyku.
     */

    if (!creationDate) {
      return true;
    }

    const difference =
      differenceInDays(
        creationDate,
        selectedDate
      );

    if (difference < 0) {
      return false;
    }

    return (
      difference %
        frequency.intervalDays ===
      0
    );
  }

  return true;
}