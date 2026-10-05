export type HabitColor = {
  id: string;
  name: string;
  primary: string;
  light: string;
  dark: string;
};

export const habitColors: HabitColor[] = [
  // =========================
  // FIOLETOWE
  // =========================

  {
    id: "purple",
    name: "Fioletowy",
    primary: "#8171E8",
    light: "#ECE9FF",
    dark: "#6253C4",
  },
  {
    id: "lavender",
    name: "Lawendowy",
    primary: "#A58BE8",
    light: "#F1ECFF",
    dark: "#7961BF",
  },
  {
    id: "violet",
    name: "Violet",
    primary: "#9B6BE3",
    light: "#F0E8FC",
    dark: "#7146B3",
  },
  {
    id: "deep-purple",
    name: "Ciemny fiolet",
    primary: "#7257C7",
    light: "#ECE8FA",
    dark: "#51399C",
  },
  {
    id: "indigo",
    name: "Indygo",
    primary: "#6674D9",
    light: "#E9EBFC",
    dark: "#4957B7",
  },

  // =========================
  // NIEBIESKIE
  // =========================

  {
    id: "blue",
    name: "Niebieski",
    primary: "#5C8EF2",
    light: "#E8F0FF",
    dark: "#3F6FCC",
  },
  {
    id: "sky-blue",
    name: "Błękit",
    primary: "#65A9E8",
    light: "#E9F5FF",
    dark: "#4385BF",
  },
  {
    id: "baby-blue",
    name: "Jasny błękit",
    primary: "#7CBCEB",
    light: "#EDF8FF",
    dark: "#5194C6",
  },
  {
    id: "ocean",
    name: "Ocean",
    primary: "#438FC5",
    light: "#E4F3FC",
    dark: "#286A99",
  },
  {
    id: "navy",
    name: "Granatowy",
    primary: "#526A9D",
    light: "#E9EDF6",
    dark: "#374C78",
  },

  // =========================
  // TURKUSOWE
  // =========================

  {
    id: "cyan",
    name: "Cyjan",
    primary: "#4AAFD1",
    light: "#E3F6FB",
    dark: "#328AA8",
  },
  {
    id: "turquoise",
    name: "Turkusowy",
    primary: "#49B9B0",
    light: "#E4F8F6",
    dark: "#328D86",
  },
  {
    id: "aqua",
    name: "Aqua",
    primary: "#5CC5C9",
    light: "#E6F9FA",
    dark: "#3B999D",
  },
  {
    id: "teal",
    name: "Morski",
    primary: "#4A9F98",
    light: "#E5F5F3",
    dark: "#31766F",
  },

  // =========================
  // ZIELONE
  // =========================

  {
    id: "green",
    name: "Zielony",
    primary: "#59B77A",
    light: "#E6F6EC",
    dark: "#3C925C",
  },
  {
    id: "mint",
    name: "Miętowy",
    primary: "#69C5A0",
    light: "#E8F8F1",
    dark: "#459A76",
  },
  {
    id: "emerald",
    name: "Szmaragdowy",
    primary: "#46A978",
    light: "#E3F5EB",
    dark: "#2E8058",
  },
  {
    id: "forest",
    name: "Leśny",
    primary: "#5A956C",
    light: "#E8F2EB",
    dark: "#3C704D",
  },
  {
    id: "lime",
    name: "Limonkowy",
    primary: "#8ABF55",
    light: "#EFF7E6",
    dark: "#65953A",
  },
  {
    id: "pistachio",
    name: "Pistacjowy",
    primary: "#9AC77B",
    light: "#F0F8EA",
    dark: "#719A55",
  },

  // =========================
  // ŻÓŁTE
  // =========================

  {
    id: "yellow",
    name: "Żółty",
    primary: "#E5B84F",
    light: "#FFF6DB",
    dark: "#B78B27",
  },
  {
    id: "sun",
    name: "Słoneczny",
    primary: "#E9C45B",
    light: "#FFF8DF",
    dark: "#B89730",
  },
  {
    id: "gold",
    name: "Złoty",
    primary: "#D5A642",
    light: "#FBF2DC",
    dark: "#A37B22",
  },
  {
    id: "mustard",
    name: "Musztardowy",
    primary: "#CDA653",
    light: "#F8F1E1",
    dark: "#9D792E",
  },

  // =========================
  // POMARAŃCZOWE
  // =========================

  {
    id: "orange",
    name: "Pomarańczowy",
    primary: "#EB9857",
    light: "#FFF0E3",
    dark: "#C67235",
  },
  {
    id: "tangerine",
    name: "Mandarynkowy",
    primary: "#EC8A4A",
    light: "#FFF0E4",
    dark: "#BE642C",
  },
  {
    id: "peach",
    name: "Brzoskwiniowy",
    primary: "#EFA47C",
    light: "#FFF0E9",
    dark: "#C27652",
  },
  {
    id: "apricot",
    name: "Morelowy",
    primary: "#E9AD75",
    light: "#FFF3E7",
    dark: "#BA7C48",
  },

  // =========================
  // CZERWONE
  // =========================

  {
    id: "red",
    name: "Czerwony",
    primary: "#E46D6D",
    light: "#FDEAEA",
    dark: "#BD4E4E",
  },
  {
    id: "coral",
    name: "Koralowy",
    primary: "#E78383",
    light: "#FDECEC",
    dark: "#BD5B5B",
  },
  {
    id: "salmon",
    name: "Łososiowy",
    primary: "#E88D82",
    light: "#FDEDEA",
    dark: "#BA6258",
  },
  {
    id: "brick",
    name: "Ceglany",
    primary: "#C86E65",
    light: "#F7E9E7",
    dark: "#994A43",
  },

  // =========================
  // RÓŻOWE
  // =========================

  {
    id: "pink",
    name: "Różowy",
    primary: "#DE78A5",
    light: "#FCEAF2",
    dark: "#B85380",
  },
  {
    id: "soft-pink",
    name: "Jasny róż",
    primary: "#E596B7",
    light: "#FDEFF5",
    dark: "#B9688C",
  },
  {
    id: "rose",
    name: "Różany",
    primary: "#D86F91",
    light: "#FBE8EF",
    dark: "#AD4A6C",
  },
  {
    id: "magenta",
    name: "Magenta",
    primary: "#C967A4",
    light: "#F7E8F2",
    dark: "#994778",
  },

  // =========================
  // BRĄZOWE / NATURALNE
  // =========================

  {
    id: "brown",
    name: "Brązowy",
    primary: "#9B7864",
    light: "#F2ECE8",
    dark: "#735443",
  },
  {
    id: "coffee",
    name: "Kawowy",
    primary: "#8C6A5A",
    light: "#F0E9E5",
    dark: "#65483B",
  },
  {
    id: "sand",
    name: "Piaskowy",
    primary: "#C0A47D",
    light: "#F7F1E8",
    dark: "#917550",
  },
  {
    id: "beige",
    name: "Beżowy",
    primary: "#B7A58B",
    light: "#F5F1EB",
    dark: "#88765D",
  },

  // =========================
  // NEUTRALNE
  // =========================

  {
    id: "gray",
    name: "Szary",
    primary: "#85858F",
    light: "#EFEFF2",
    dark: "#62626A",
  },
  {
    id: "blue-gray",
    name: "Niebieskoszary",
    primary: "#788896",
    light: "#EDF0F2",
    dark: "#566571",
  },
  {
    id: "warm-gray",
    name: "Ciepły szary",
    primary: "#938B87",
    light: "#F1EFEE",
    dark: "#6C6460",
  },
  {
    id: "graphite",
    name: "Grafitowy",
    primary: "#62636A",
    light: "#EBEBED",
    dark: "#414248",
  },
];