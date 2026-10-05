import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Polyline,
} from "react-native-svg";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
import HabitIcon from "./HabitIcon";
import type { LegacyHabitIcon } from "../types/legacy-habit-icon";

export type ProgressBreakdownRow = {
  id: string;
  name: string;
  icon: string | LegacyHabitIcon;
  color: string;
  iconBackground: string;
  completed: number;
  expected: number;
  successRate: number;
  averagePerDay: number;
  bestStreak?: number;
  streakUnit?: "dni" | "tyg.";
  trend: (number | null)[];
};

type Props = {
  rows: ProgressBreakdownRow[];
  periodLabel: string;
  title?: string;
  showStreak?: boolean;
};

function TrendSparkline({
  values,
  colors,
}: {
  values: (number | null)[];
  colors: AppThemeColors;
}) {
  const points = values.flatMap((value, index) =>
    value === null ? [] : [{ index, value }]
  );

  if (points.length === 0) {
    return <Text style={{ color: colors.textMuted }}>—</Text>;
  }

  const firstValue = points[0].value;
  const lastValue = points[points.length - 1].value;
  const direction =
    lastValue > firstValue
      ? "up"
      : lastValue < firstValue
        ? "down"
        : "flat";
  const trendColor =
    direction === "up"
      ? colors.success
      : direction === "down"
        ? colors.danger
        : colors.textMuted;
  const chartWidth = 48;
  const chartHeight = 24;
  const coordinates = points.map(({ index, value }) => {
    const x =
      values.length > 1
        ? (index / (values.length - 1)) * chartWidth
        : chartWidth / 2;
    const y = chartHeight - 3 - (value / 100) * (chartHeight - 6);
    return { x, y };
  });

  return (
    <View
      style={styles.sparkline}
      accessibilityLabel={
        direction === "up"
          ? "Trend rosnący"
          : direction === "down"
            ? "Trend spadkowy"
            : "Trend stabilny"
      }
    >
      <Svg width={chartWidth} height={chartHeight}>
        {coordinates.length > 1 && (
          <Polyline
            points={coordinates
              .map(({ x, y }) => `${x},${y}`)
              .join(" ")}
            fill="none"
            stroke={trendColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <Circle
          cx={coordinates[coordinates.length - 1].x}
          cy={coordinates[coordinates.length - 1].y}
          r={2.5}
          fill={trendColor}
        />
      </Svg>
      <Text style={[styles.trendArrow, { color: trendColor }]}>
        {direction === "up" ? "↑" : direction === "down" ? "↓" : "→"}
      </Text>
    </View>
  );
}

export default function ProgressHabitBreakdown({
  rows,
  periodLabel,
  title = "WYNIKI NAWYKÓW",
  showStreak = false,
}: Props) {
  const { colors } = useTheme();
  const themedStyles = createStyles(colors);

  return (
    <View style={themedStyles.card}>
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>{title}</Text>
        <View style={themedStyles.periodBadge}>
          <Text style={themedStyles.periodText}>{periodLabel}</Text>
        </View>
      </View>
      {rows.length === 0 ? (
        <View style={themedStyles.emptyState}>
          <Text style={themedStyles.emptyText}>
            Brak zaplanowanych wykonań w tym okresie.
          </Text>
        </View>
      ) : (
        rows.map((row, index) => (
          <View
            key={row.id}
            style={[
              themedStyles.row,
              index === rows.length - 1 && themedStyles.lastRow,
            ]}
          >
            <View style={themedStyles.primaryRow}>
              <View style={themedStyles.nameCell}>
                <View
                  style={[
                    themedStyles.iconContainer,
                    { backgroundColor: row.iconBackground },
                  ]}
                >
                  <HabitIcon name={row.icon} size={18} color={row.color} />
                </View>
                <View style={themedStyles.nameTextContent}>
                  <Text style={themedStyles.habitName} numberOfLines={1}>
                    {row.name}
                  </Text>
                </View>
              </View>
              <View style={themedStyles.successCell}>
                <Text style={themedStyles.successRate}>
                  {row.expected > 0 ? `${row.successRate}%` : "—"}
                </Text>
                <Text style={themedStyles.metricSubValue}>
                  {row.expected > 0
                    ? `${row.completed}/${row.expected}`
                    : "brak planu"}
                </Text>
              </View>
            </View>
            <View style={themedStyles.metricsRow}>
              <View style={themedStyles.metricGroup}>
                <Text style={themedStyles.metricLabel}>TREND</Text>
                <TrendSparkline values={row.trend} colors={colors} />
              </View>
              <View style={themedStyles.metricGroup}>
                <Text style={themedStyles.metricLabel}>ŚR./DZIEŃ</Text>
                <Text style={themedStyles.metricValue}>
                  {row.expected > 0
                    ? row.averagePerDay.toLocaleString("pl-PL", {
                        maximumFractionDigits: 1,
                      })
                    : "—"}
                </Text>
              </View>
              {showStreak && (
                <View style={themedStyles.metricGroup}>
                  <Text style={themedStyles.metricLabel}>PASSA</Text>
                  <Text style={themedStyles.metricValue}>
                    {row.bestStreak ?? 0} {row.streakUnit ?? "dni"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
  },
  trendArrow: {
    width: 12,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingTop: 14,
      paddingBottom: 4,
      marginBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
      paddingHorizontal: 2,
    },
    title: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "800",
    },
    periodBadge: {
      minHeight: 24,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    periodText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
    },
    row: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    primaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    nameCell: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    habitName: {
      flex: 1,
      minWidth: 0,
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    nameTextContent: {
      flex: 1,
      minWidth: 0,
    },
    successCell: {
      minWidth: 68,
      alignItems: "flex-end",
    },
    successRate: {
      color: colors.text,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    metricsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 12,
      paddingLeft: 48,
    },
    metricGroup: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    metricLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "700",
    },
    metricValue: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    metricSubValue: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: "700",
      fontVariant: ["tabular-nums"],
    },
    emptyState: {
      minHeight: 70,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 11,
      textAlign: "center",
    },
  });
}