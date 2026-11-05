import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { HabitsProvider } from "../context/HabitsContext";
import { HabitEntriesProvider } from "../context/HabitEntriesContext";
import { RoutinesProvider } from "../context/RoutinesContext";
import { RoutineEntriesProvider } from "../context/RoutineEntriesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

void SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { isLoading } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <HabitsProvider>
        <HabitEntriesProvider>
          <RoutinesProvider>
            <RoutineEntriesProvider>
              <AppNavigator />
            </RoutineEntriesProvider>
          </RoutinesProvider>
        </HabitEntriesProvider>
      </HabitsProvider>
    </ThemeProvider>
  );
}