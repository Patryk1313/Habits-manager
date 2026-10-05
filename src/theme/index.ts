import {
  darkColors,
  lightColors,
} from "./colors";

import {
  radius,
} from "./radius";

import {
  spacing,
} from "./spacing";

import {
  typography,
} from "./typography";

// =========================
// DARK THEME
// =========================

export const darkTheme = {
  colors: darkColors,

  spacing,

  radius,

  typography,
} as const;

// =========================
// LIGHT THEME
// =========================

export const lightTheme = {
  colors: lightColors,

  spacing,

  radius,

  typography,
} as const;

// =========================
// DOMYŚLNY MOTYW
// =========================
//
// Na razie projektujemy nowy wygląd
// aplikacji w wersji ciemnej.
//
// Później podłączymy:
// - jasny
// - ciemny
// - systemowy
// =========================

export const theme =
  darkTheme;

// =========================
// EXPORT
// =========================

export {
  darkColors,
  lightColors,
  radius,
  spacing,
  typography,
};

export type AppTheme =
  typeof darkTheme | typeof lightTheme;