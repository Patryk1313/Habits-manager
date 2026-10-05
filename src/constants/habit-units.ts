export type HabitUnitCategory =
  | "Masa"
  | "Objętość"
  | "Dystans"
  | "Czas"
  | "Aktywność"
  | "Inne";

export type HabitUnit = {
  id: string;
  name: string;
  symbol: string;
  category: HabitUnitCategory;
};

export const habitUnits: HabitUnit[] = [
  // MASA
  {
    id: "mg",
    name: "Miligramy",
    symbol: "mg",
    category: "Masa",
  },
  {
    id: "g",
    name: "Gramy",
    symbol: "g",
    category: "Masa",
  },
  {
    id: "kg",
    name: "Kilogramy",
    symbol: "kg",
    category: "Masa",
  },

  // OBJĘTOŚĆ
  {
    id: "ml",
    name: "Mililitry",
    symbol: "ml",
    category: "Objętość",
  },
  {
    id: "l",
    name: "Litry",
    symbol: "l",
    category: "Objętość",
  },

  // DYSTANS
  {
    id: "m",
    name: "Metry",
    symbol: "m",
    category: "Dystans",
  },
  {
    id: "km",
    name: "Kilometry",
    symbol: "km",
    category: "Dystans",
  },

  // CZAS
  {
    id: "min",
    name: "Minuty",
    symbol: "min",
    category: "Czas",
  },
  {
    id: "h",
    name: "Godziny",
    symbol: "h",
    category: "Czas",
  },

  // AKTYWNOŚĆ
  {
    id: "steps",
    name: "Kroki",
    symbol: "kroków",
    category: "Aktywność",
  },
  {
    id: "repetitions",
    name: "Powtórzenia",
    symbol: "powt.",
    category: "Aktywność",
  },
  {
    id: "sets",
    name: "Serie",
    symbol: "serii",
    category: "Aktywność",
  },

  // INNE
  {
    id: "pages",
    name: "Strony",
    symbol: "stron",
    category: "Inne",
  },
  {
    id: "times",
    name: "Razy",
    symbol: "razy",
    category: "Inne",
  },
  {
    id: "glasses",
    name: "Szklanki",
    symbol: "szklanek",
    category: "Inne",
  },
];