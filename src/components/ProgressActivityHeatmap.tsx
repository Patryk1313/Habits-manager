import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import type {
  DailyProgressStats,
} from "../utils/progress-stats";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
// =========================
// TYPY
// =========================
type Props = {
  data: DailyProgressStats[];
  title?: string;
  periodLabel?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};
// =========================
// STAŁE
// =========================
const DAYS = [
  "P",
  "W",
  "Ś",
  "C",
  "P",
  "S",
  "N",
];
const CELL_SIZE = 24;
const CELL_GAP = 5;
// =========================
// HELPERY
// =========================
function getIntensity(
  day: DailyProgressStats
) {
  if (
    day.expected === 0 &&
    !day.hasActivity
  ) {
    return 0;
  }
  if (
    day.successRate <= 0
  ) {
    return 1;
  }
  if (
    day.successRate <= 25
  ) {
    return 2;
  }
  if (
    day.successRate <= 50
  ) {
    return 3;
  }
  if (
    day.successRate <= 75
  ) {
    return 4;
  }
  return 5;
}
// =========================
// KOMPONENT
// =========================
export default function ProgressActivityHeatmap({
  data,
  title = "AKTYWNOŚĆ",
  periodLabel = "12 TYGODNI",
  collapsed,
  onToggleCollapsed,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const getCellStyle = (
    intensity: number
  ) => {
    if (intensity === 0) {
      return styles.cellEmpty;
    }
    if (intensity === 1) {
      return styles.cellLevel1;
    }
    if (intensity === 2) {
      return styles.cellLevel2;
    }
    if (intensity === 3) {
      return styles.cellLevel3;
    }
    if (intensity === 4) {
      return styles.cellLevel4;
    }
    return styles.cellLevel5;
  };
  // =========================
  // PODZIAŁ NA TYGODNIE
  // =========================
  const weeks: DailyProgressStats[][] =
    [];
  for (
    let index = 0;
    index < data.length;
    index += 7
  ) {
    weeks.push(
      data.slice(
        index,
        index + 7
      )
    );
  }
  // =========================
  // PODSUMOWANIE
  // =========================
  const daysWithPlan =
    data.filter(
      (day) =>
        day.expected > 0
    ).length;
  const perfectDays =
    data.filter(
      (day) =>
        day.expected > 0 &&
        day.successRate ===
          100
    ).length;
  const average =
    daysWithPlan > 0
      ? Math.round(
          data.reduce(
            (
              total,
              day
            ) =>
              total +
              (day.expected > 0
                ? day.successRate
                : 0),
            0
          ) /
            daysWithPlan
        )
      : 0;
  return (
    <View
      style={
        styles.card
      }
    >
      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}
      <Pressable
        onPress={onToggleCollapsed}
        accessibilityRole="button"
        accessibilityState={{
          expanded: !collapsed,
        }}
        style={
          [
            styles.header,
            collapsed && styles.headerCollapsed,
          ]
        }
      >
        <Text
          style={
            styles.title
          }
        >
          {title}
        </Text>
        <View
          style={
            styles.periodBadge
          }
        >
          <Text
            style={
              styles.periodText
            }
          >
            {periodLabel}
          </Text>
        </View>
        {collapsed ? (
          <ChevronDown size={19} color={colors.textMuted} />
        ) : (
          <ChevronUp size={19} color={colors.textMuted} />
        )}
      </Pressable>
      {/* ===================== */}
      {/* HEATMAP */}
      {/* ===================== */}
      {!collapsed && (data.length === 0 ? (
        <View
          style={
            styles.emptyState
          }
        >
          <Text
            style={
              styles.emptyStateText
            }
          >
            Brak danych do
            wyświetlenia.
          </Text>
        </View>
      ) : (
        <>
          <View
            style={
              styles.heatmapRow
            }
          >
            {/* ================= */}
            {/* DNI TYGODNIA */}
            {/* ================= */}
            <View
              style={
                styles.daysColumn
              }
            >
              {DAYS.map(
                (
                  day,
                  index
                ) => (
                  <View
                    key={
                      `${day}-${index}`
                    }
                    style={
                      styles.dayLabelContainer
                    }
                  >
                    <Text
                      style={
                        styles.dayLabel
                      }
                    >
                      {day}
                    </Text>
                  </View>
                )
              )}
            </View>
            {/* ================= */}
            {/* TYGODNIE */}
            {/* ================= */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.weeksContainer
              }
            >
              {weeks.map(
                (
                  week,
                  weekIndex
                ) => (
                  <View
                    key={
                      `week-${weekIndex}`
                    }
                    style={
                      styles.weekColumn
                    }
                  >
                    {Array.from({
                      length: 7,
                    }).map(
                      (
                        _,
                        dayIndex
                      ) => {
                        const day =
                          week[
                            dayIndex
                          ];
                        if (
                          !day
                        ) {
                          return (
                            <View
                              key={
                                `empty-${dayIndex}`
                              }
                              style={
                                styles.placeholderCell
                              }
                            />
                          );
                        }
                        const intensity =
                          getIntensity(
                            day
                          );
                        return (
                          <View
                            key={
                              day.dateKey
                            }
                            style={[
                              styles.cell,
                              getCellStyle(
                                intensity
                              ),
                            ]}
                          >
                            {day.expected >
                              0 &&
                              day.successRate ===
                                100 && (
                                <View
                                  style={
                                    styles.perfectDot
                                  }
                                />
                              )}
                          </View>
                        );
                      }
                    )}
                  </View>
                )
              )}
            </ScrollView>
          </View>
          {/* =================== */}
          {/* LEGENDA */}
          {/* =================== */}
          <View
            style={
              styles.legendRow
            }
          >
            <Text
              style={
                styles.legendText
              }
            >
              Mniej
            </Text>
            <View
              style={[
                styles.legendCell,
                styles.cellLevel1,
              ]}
            />
            <View
              style={[
                styles.legendCell,
                styles.cellLevel2,
              ]}
            />
            <View
              style={[
                styles.legendCell,
                styles.cellLevel3,
              ]}
            />
            <View
              style={[
                styles.legendCell,
                styles.cellLevel4,
              ]}
            />
            <View
              style={[
                styles.legendCell,
                styles.cellLevel5,
              ]}
            />
            <Text
              style={
                styles.legendText
              }
            >
              Więcej
            </Text>
          </View>
          {/* =================== */}
          {/* PODSUMOWANIE */}
          {/* =================== */}
          <View
            style={
              styles.summary
            }
          >
            <View
              style={
                styles.summaryItem
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                ŚREDNIO
              </Text>
              <Text
                style={
                  styles.summaryValue
                }
              >
                {average}%
              </Text>
            </View>
            <View
              style={
                styles.summaryDivider
              }
            />
            <View
              style={
                styles.summaryItem
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                PEŁNE DNI
              </Text>
              <Text
                style={
                  styles.summaryValue
                }
              >
                {perfectDays}
              </Text>
            </View>
          </View>
        </>
      ))}
    </View>
  );
}
// =========================
// STYLE
// =========================
function createStyles(
  colors: AppThemeColors
) {
  return StyleSheet.create({
    // =====================
    // CARD
    // =====================
    card: {
      backgroundColor:
        colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        colors.border,
      paddingHorizontal: 16,
      paddingTop: 17,
      paddingBottom: 16,
    },
    // =====================
    // HEADER
    // =====================
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },
    headerCollapsed: {
      marginBottom: 0,
    },
    title: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.9,
    },
    periodBadge: {
      minHeight: 28,
      paddingHorizontal: 11,
      borderRadius: 10,
      backgroundColor:
        colors.accentSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: "center",
      justifyContent:
        "center",
    },
    periodText: {
      color: colors.accent,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    // =====================
    // HEATMAP
    // =====================
    heatmapRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
    },
    daysColumn: {
      width: 20,
      marginRight: 8,
    },
    dayLabelContainer: {
      width: 20,
      height:
        CELL_SIZE,
      marginBottom:
        CELL_GAP,
      alignItems:
        "flex-start",
      justifyContent:
        "center",
    },
    dayLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "700",
    },
    weeksContainer: {
      paddingRight: 2,
    },
    weekColumn: {
      marginRight:
        CELL_GAP,
    },
    cell: {
      width:
        CELL_SIZE,
      height:
        CELL_SIZE,
      borderRadius: 7,
      marginBottom:
        CELL_GAP,
      alignItems: "center",
      justifyContent:
        "center",
    },
    placeholderCell: {
      width:
        CELL_SIZE,
      height:
        CELL_SIZE,
      marginBottom:
        CELL_GAP,
    },
    // =====================
    // INTENSITY
    // =====================
    cellEmpty: {
      backgroundColor:
        colors.surfaceSecondary,
      borderWidth: 1,
      borderColor:
        colors.border,
    },
    cellLevel1: {
      backgroundColor:
        `${colors.accent}1F`,
      borderWidth: 1,
      borderColor:
        `${colors.accent}33`,
    },
    cellLevel2: {
      backgroundColor:
        `${colors.accent}3D`,
      borderWidth: 1,
      borderColor:
        `${colors.accent}52`,
    },
    cellLevel3: {
      backgroundColor:
        `${colors.accent}66`,
      borderWidth: 1,
      borderColor:
        `${colors.accent}7A`,
    },
    cellLevel4: {
      backgroundColor:
        `${colors.accent}99`,
      borderWidth: 1,
      borderColor:
        `${colors.accent}AD`,
    },
    cellLevel5: {
      backgroundColor:
        colors.accent,
      borderWidth: 1,
      borderColor:
        colors.accent,
    },
    perfectDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        "#FFFFFF",
    },
    // =====================
    // LEGENDA
    // =====================
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "flex-end",
      marginTop: 9,
      gap: 4,
    },
    legendText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "600",
      marginHorizontal: 3,
    },
    legendCell: {
      width: 11,
      height: 11,
      borderRadius: 3,
    },
    // =====================
    // SUMMARY
    // =====================
    summary: {
      marginTop: 17,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
    },
    summaryDivider: {
      width: 1,
      height: 34,
      backgroundColor:
        colors.border,
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "800",
      letterSpacing: 0.7,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
      marginTop: 4,
    },
    // =====================
    // EMPTY
    // =====================
    emptyState: {
      minHeight: 120,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        colors.surfaceSecondary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        colors.border,
    },
    emptyStateText: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: "center",
    },
    });
}
