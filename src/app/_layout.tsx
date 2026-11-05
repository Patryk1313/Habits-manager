import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import AuthScreen from "../components/AuthScreen";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { HabitsProvider } from "../context/HabitsContext";
import { HabitEntriesProvider } from "../context/HabitEntriesContext";
import { RoutinesProvider } from "../context/RoutinesContext";
import { RoutineEntriesProvider } from "../context/RoutineEntriesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

void SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { isLoading } = useTheme();
  const { user, isLoading: isAuthLoading } = useAuth();
  const ready = !isLoading && !isAuthLoading;

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  if (!user) {
    return <AuthScreen />;
  }

  // key zeruje stan danych przy zmianie konta.
  return (
    <HabitsProvider key={user.uid}>
      <HabitEntriesProvider>
        <RoutinesProvider>
          <RoutineEntriesProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </RoutineEntriesProvider>
        </RoutinesProvider>
      </HabitEntriesProvider>
    </HabitsProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
