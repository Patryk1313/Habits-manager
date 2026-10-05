import { Tabs } from "expo-router";
import {
  ChartNoAxesColumnIncreasing,
  CircleCheck,
  ListChecks,
  Settings,
} from "lucide-react-native";

import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Nawyki",
          tabBarIcon: ({ color }) => (
            <CircleCheck
              size={23}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Postęp",
          tabBarIcon: ({ color }) => (
            <ChartNoAxesColumnIncreasing
              size={23}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="routines"
        options={{
          title: "Rutyny",
          tabBarIcon: ({ color }) => (
            <ListChecks
              size={23}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ustawienia",
          tabBarIcon: ({ color }) => (
            <Settings
              size={23}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}