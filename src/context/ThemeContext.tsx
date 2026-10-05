import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// =========================
// STORAGE
// =========================

const THEME_STORAGE_KEY =
  "@habits/theme";

// =========================
// TYPY
// =========================

export type AppThemeMode =
  | "dark"
  | "light";

export type AppAccentColor =
  | "auto"
  | "purple"
  | "blue"
  | "green"
  | "pink"
  | "orange";

export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  accent: string;
  accentSoft: string;
  accentForeground: string;

  success: string;
  danger: string;
};

// =========================
// KOLORY AKCENTU
// =========================

export const accentColors: Record<
  Exclude<AppAccentColor, "auto">,
  {
    name: string;
    primary: string;
    soft: string;
    lightSoft: string;
  }
> = {
  purple: {
    name: "Fioletowy",
    primary: "#8171E8",
    soft: "#2A263D",
    lightSoft: "#F0EDF9",
  },

  blue: {
    name: "Niebieski",
    primary: "#5C8EF2",
    soft: "#202B42",
    lightSoft: "#E4F2FF",
  },

  green: {
    name: "Zielony",
    primary: "#59B77A",
    soft: "#20352A",
    lightSoft: "#E8F5EC",
  },

  pink: {
    name: "Różowy",
    primary: "#DE78A5",
    soft: "#3B2531",
    lightSoft: "#FAECF2",
  },

  orange: {
    name: "Pomarańczowy",
    primary: "#EB9857",
    soft: "#3B2B20",
    lightSoft: "#FFF1E2",
  },
};

// =========================
// PALETA DARK
// =========================

const darkBaseColors = {
  background: "#101014",

  surface: "#18181F",

  surfaceSecondary: "#222229",

  border: "#292932",

  text: "#F7F7FA",

  textSecondary: "#A0A0A9",

  textMuted: "#777780",

  success: "#59B77A",

  danger: "#E46D6D",
};

// =========================
// PALETA LIGHT
// =========================

const lightBaseColors = {
  background: "#F7F7FA",

  surface: "#FFFFFF",

  surfaceSecondary: "#EFEFF4",

  border: "#E4E4EA",

  text: "#202027",

  textSecondary: "#62626A",

  textMuted: "#85858E",

  success: "#46A978",

  danger: "#E46D6D",
};

// =========================
// ZAPISYWANE USTAWIENIA
// =========================

type StoredThemeSettings = {
  mode: AppThemeMode;
  accent: AppAccentColor;
};

// =========================
// CONTEXT
// =========================

type ThemeContextType = {
  mode: AppThemeMode;

  accent: AppAccentColor;

  colors: AppThemeColors;

  isLoading: boolean;

  setMode: (
    mode: AppThemeMode
  ) => void;

  setAccent: (
    accent: AppAccentColor
  ) => void;
};

const ThemeContext =
  createContext<
    ThemeContextType | undefined
  >(undefined);

// =========================
// PROVIDER
// =========================

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [mode, setModeState] =
    useState<AppThemeMode>("dark");

  const [accent, setAccentState] =
    useState<AppAccentColor>(
      "purple"
    );

  const [isLoading, setIsLoading] =
    useState(true);

  // =========================
  // WCZYTANIE USTAWIEŃ
  // =========================

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );

        if (!stored) {
          return;
        }

        const parsed: StoredThemeSettings =
          JSON.parse(stored);

        if (
          parsed.mode === "dark" ||
          parsed.mode === "light"
        ) {
          setModeState(parsed.mode);
        }

        if (
          parsed.accent === "auto" ||
          (parsed.accent && parsed.accent in accentColors)
        ) {
          setAccentState(
            parsed.accent
          );
        }
      } catch (error) {
        console.error(
          "Błąd podczas wczytywania motywu:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // =========================
  // ZAPIS USTAWIEŃ
  // =========================

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const saveTheme = async () => {
      try {
        const settings: StoredThemeSettings =
          {
            mode,
            accent,
          };

        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify(settings)
        );
      } catch (error) {
        console.error(
          "Błąd podczas zapisywania motywu:",
          error
        );
      }
    };

    saveTheme();
  }, [
    mode,
    accent,
    isLoading,
  ]);

  // =========================
  // ZMIANA MOTYWU
  // =========================

  const setMode = (
    newMode: AppThemeMode
  ) => {
    setModeState(newMode);
  };

  // =========================
  // ZMIANA AKCENTU
  // =========================

  const setAccent = (
    newAccent: AppAccentColor
  ) => {
    setAccentState(newAccent);
  };

  // =========================
  // GENEROWANIE PALETY
  // =========================

  const baseColors =
    mode === "dark"
      ? darkBaseColors
      : lightBaseColors;

  const selectedAccent =
    accent === "auto"
      ? null
      : accentColors[accent];
  const automaticAccent =
    mode === "dark"
      ? "#FFFFFF"
      : "#000000";

  const colors: AppThemeColors = {
    ...baseColors,

    accent:
      selectedAccent?.primary ?? automaticAccent,

    accentSoft:
      selectedAccent
        ? mode === "dark"
          ? selectedAccent.soft
          : selectedAccent.lightSoft
        : baseColors.surfaceSecondary,

    accentForeground:
      accent === "auto" && mode === "dark"
        ? "#101014"
        : "#FFFFFF",
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        colors,
        isLoading,
        setMode,
        setAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// =========================
// HOOK
// =========================

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme musi być używany wewnątrz ThemeProvider"
    );
  }

  return context;
}