import { Tabs } from "expo-router";
import {
  ChartNoAxesColumnIncreasing,
  CircleCheck,
  ListChecks,
  Settings,
} from "lucide-react-native";
import { useWindowDimensions } from "react-native";

import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarPosition: isDesktop ? "left" : "bottom",
        tabBarVariant: isDesktop ? "material" : "uikit",
        tabBarLabelPosition: isDesktop ? "beside-icon" : "below-icon",
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarActiveBackgroundColor: isDesktop
          ? colors.accentSoft
          : undefined,

        tabBarStyle: isDesktop
          ? {
              width: 256,
              backgroundColor: colors.surface,
              borderRightWidth: 1,
              borderRightColor: colors.border,
              paddingTop: 28,
              paddingHorizontal: 12,
              elevation: 0,
            }
          : {
              height: 72,
              paddingTop: 8,
              paddingBottom: 8,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              elevation: 0,
            },

        tabBarLabelStyle: {
          fontSize: isDesktop ? 14 : 11,
          fontWeight: "600",
          textAlign: "left",
        },

        tabBarItemStyle: isDesktop
          ? {
              minHeight: 48,
              borderRadius: 12,
              marginBottom: 6,
              paddingHorizontal: 12,
            }
          : undefined,

        sceneStyle: isDesktop
          ? {
              width: "100%",
              maxWidth: 1440,
              alignSelf: "center",
            }
          : undefined,
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