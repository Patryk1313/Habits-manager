// =========================
// DARK THEME
// =========================

export const darkColors = {
  // =======================
  // TŁA
  // =======================

  background: "#050505",

  surface: "#0A0A0A",

  surfaceRaised: "#111111",

  surfaceSoft: "#171717",

  // =======================
  // OBRAMOWANIA
  // =======================

  border: "#242424",

  borderSoft: "#1A1A1A",

  borderStrong: "#303030",

  // =======================
  // TEKST
  // =======================

  text: "#F5F5F5",

  textSecondary: "#A3A3A3",

  textMuted: "#6F6F6F",

  textDisabled: "#484848",

  // =======================
  // AKCENTY
  // =======================

  success: "#4CC765",

  successSoft: "#102D18",

  warning: "#D79B22",

  warningSoft: "#33250C",

  danger: "#E26666",

  dangerSoft: "#321616",

  info: "#5A9EF5",

  infoSoft: "#10243D",

  // =======================
  // ELEMENTY UI
  // =======================

  track: "#262626",

  overlay: "rgba(0, 0, 0, 0.72)",

  shadow: "#000000",

  white: "#FFFFFF",

  black: "#000000",
} as const;

// =========================
// LIGHT THEME
// =========================

export const lightColors = {
  // =======================
  // TŁA
  // =======================

  background: "#F7F7FA",

  surface: "#FFFFFF",

  surfaceRaised: "#FFFFFF",

  surfaceSoft: "#F1F1F5",

  // =======================
  // OBRAMOWANIA
  // =======================

  border: "#E5E5EA",

  borderSoft: "#EFEFF3",

  borderStrong: "#D8D8DE",

  // =======================
  // TEKST
  // =======================

  text: "#202027",

  textSecondary: "#85858E",

  textMuted: "#A0A0A8",

  textDisabled: "#C1C1C7",

  // =======================
  // AKCENTY
  // =======================

  success: "#42A56B",

  successSoft: "#E7F5EC",

  warning: "#C98C1D",

  warningSoft: "#FFF4DB",

  danger: "#D26464",

  dangerSoft: "#FCEAEA",

  info: "#5C8EF2",

  infoSoft: "#E8F0FF",

  // =======================
  // ELEMENTY UI
  // =======================

  track: "#E8E8ED",

  overlay: "rgba(0, 0, 0, 0.35)",

  shadow: "#000000",

  white: "#FFFFFF",

  black: "#000000",
} as const;

// =========================
// TYP
// =========================

export type ThemeColors =
  typeof darkColors | typeof lightColors;