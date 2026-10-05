import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";

export type ProgressVolumePoint = {
  label: string;
  dateLabel?: string;
  completed: number;
  missed: number;
};

type Props = {
  data: ProgressVolumePoint[];
  periodLabel: string;
};

const PLOT_HEIGHT = 104;
const X_LABEL_HEIGHT = 26;
const BAR_GROUP_HEIGHT = PLOT_HEIGHT + 6 + X_LABEL_HEIGHT;

export default function ProgressVolumeChart({
  data,
  periodLabel,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const maxPlanned = Math.max(
    0,
    ...data.map((point) => point.completed + point.missed)
  );
  const scaleMax = Math.max(1, maxPlanned);
  const middleTick = Math.round(scaleMax / 2);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>WYKONANIA W CZASIE</Text>
          <Text style={styles.subtitle}>Wynik względem planu</Text>
        </View>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>{periodLabel}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.completedSwatch]} />
          <Text style={styles.legendText}>Wykonane</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, styles.missedSwatch]} />
          <Text style={styles.legendText}>Pominięte</Text>
        </View>
      </View>

      {data.length === 0 || maxPlanned === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Brak zaplanowanych zadań w tym okresie.
          </Text>
        </View>
      ) : (
        <View style={styles.chartRow}>
          <View style={styles.yAxis}>
            <Text style={styles.axisText}>{scaleMax}</Text>
            <Text style={styles.axisText}>{middleTick}</Text>
            <Text style={styles.axisText}>0</Text>
          </View>
          <View style={styles.plot}>
            <View style={[styles.gridLine, styles.gridTop]} />
            <View style={[styles.gridLine, styles.gridMiddle]} />
            <View style={[styles.gridLine, styles.gridBottom]} />
            <View style={styles.barRow}>
              {data.map((point, index) => {
                const planned = point.completed + point.missed;
                const stackHeight = (planned / scaleMax) * PLOT_HEIGHT;
                const completedHeight =
                  planned > 0
                    ? (point.completed / planned) * stackHeight
                    : 0;
                const missedHeight = Math.max(
                  0,
                  stackHeight - completedHeight
                );

                return (
                  <View
                    key={`${point.label}-${index}`}
                    style={styles.barGroup}
                  >
                    <View style={styles.barTrack}>
                      {planned > 0 && (
                        <View style={{ height: stackHeight }}>
                          {missedHeight > 0 && (
                            <View
                              style={[
                                styles.barSegment,
                                styles.missedSegment,
                                { height: missedHeight },
                              ]}
                            />
                          )}
                          {completedHeight > 0 && (
                            <View
                              style={[
                                styles.barSegment,
                                styles.completedSegment,
                                { height: completedHeight },
                              ]}
                            />
                          )}
                        </View>
                      )}
                    </View>
                    <View style={styles.xAxisLabels}>
                      <Text style={styles.xAxisText} numberOfLines={1}>
                        {point.label}
                      </Text>
                      {point.dateLabel && (
                        <Text style={styles.xAxisDate} numberOfLines={1}>
                          {point.dateLabel}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 17,
      paddingBottom: 15,
      marginBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    heading: {
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    title: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "800",
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "600",
      marginTop: 4,
    },
    periodBadge: {
      minHeight: 28,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    periodText: {
      color: colors.accent,
      fontSize: 9,
      fontWeight: "800",
    },
    legend: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    legendSwatch: {
      width: 8,
      height: 8,
      borderRadius: 3,
    },
    completedSwatch: {
      backgroundColor: colors.success,
    },
    missedSwatch: {
      backgroundColor: colors.danger,
    },
    legendText: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "600",
    },
    chartRow: {
      flexDirection: "row",
      height: BAR_GROUP_HEIGHT,
    },
    yAxis: {
      width: 24,
      height: PLOT_HEIGHT,
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingTop: 1,
      paddingBottom: 1,
    },
    axisText: {
      color: colors.textMuted,
      fontSize: 8,
      fontVariant: ["tabular-nums"],
    },
    plot: {
      flex: 1,
      minWidth: 0,
      height: BAR_GROUP_HEIGHT,
      position: "relative",
    },
    gridLine: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
    },
    gridTop: {
      top: 0,
    },
    gridMiddle: {
      top: PLOT_HEIGHT / 2,
    },
    gridBottom: {
      top: PLOT_HEIGHT - 1,
    },
    barRow: {
      height: BAR_GROUP_HEIGHT,
      flexDirection: "row",
      alignItems: "flex-end",
    },
    barGroup: {
      flex: 1,
      minWidth: 0,
      height: BAR_GROUP_HEIGHT,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    barTrack: {
      width: 18,
      height: PLOT_HEIGHT,
      justifyContent: "flex-end",
      overflow: "hidden",
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      marginBottom: 6,
    },
    barSegment: {
      width: "100%",
    },
    completedSegment: {
      backgroundColor: colors.success,
    },
    missedSegment: {
      backgroundColor: colors.danger,
    },
    xAxisText: {
      maxWidth: "100%",
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "600",
      textAlign: "center",
    },
    xAxisLabels: {
      width: "100%",
      height: X_LABEL_HEIGHT,
      alignItems: "center",
    },
    xAxisDate: {
      color: colors.textMuted,
      fontSize: 7,
      fontVariant: ["tabular-nums"],
      textAlign: "center",
    },
    emptyState: {
      minHeight: 100,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 11,
      textAlign: "center",
    },
  });
}