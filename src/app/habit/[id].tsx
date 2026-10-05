import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useMemo,
} from "react";
import {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Svg,
} from "react-native-svg";
import {
  habitColors,
} from "../../constants/habit-colors";
import {
  useHabits,
} from "../../context/HabitsContext";
import {
  useHabitEntries,
} from "../../context/HabitEntriesContext";
import HabitActivityGrid from "../../components/HabitActivityGrid";
import HabitIcon from "../../components/HabitIcon";
import {
  AppThemeColors,
  useTheme,
} from "../../context/ThemeContext";
import {
  addDays,
  calculateProgressStats,
  getDateKey,
  isHabitAliveOnDate,
  isScheduledDay,
  startOfDay,
} from "../../utils/progress-stats";
// =========================
// STAŁE
// =========================
const CHART_DAYS = 14;
// =========================
// HELPERY
// =========================
function getTrendText(
  current: number,
  previous: number
) {
  const change = Math.round(current - previous);
  if (change === 0) {
    return {
      value: "0 %.",
      direction: "neutral" as const,
    };
  }
  if (
    change > 0
  ) {
    return {
      value: `+${change} %`,
      direction: "up" as const,
    };
  }
  return {
    value: `−${Math.abs(change)} %`,
    direction: "down" as const,
  };
}
// =========================
// MINI WYKRES
// =========================
type MiniChartProps = {
  values: number[];
  color: string;
  styles: ReturnType<typeof createStyles>;
  colors: AppThemeColors;
};
function MiniChart({
  values,
  color,
  styles,
  colors,
}: MiniChartProps) {
  const width = 132;
  const height = 62;
  const paddingX = 4;
  const paddingY = 6;
  if (values.length === 0) {
    return (
      <View
        style={[
          styles.chart,
          {
            width,
            height,
          },
        ]}
      />
    );
  }
  const chartWidth =
    width - paddingX * 2;
  const chartHeight =
    height - paddingY * 2;
  const maxIndex =
    Math.max(
      1,
      values.length - 1
    );
  const points =
    values.map(
      (value, index) => {
        const safeValue =
          Math.max(
            0,
            Math.min(
              100,
              value
            )
          );
        const x =
          paddingX +
          (index / maxIndex) *
            chartWidth;
        const y =
          paddingY +
          (1 -
            safeValue / 100) *
            chartHeight;
        return {
          x,
          y,
        };
      }
    );
  const linePath =
    points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");
  const firstPoint =
    points[0];
  const lastPoint =
    points[
      points.length - 1
    ];
  const areaPath =
    `${linePath} ` +
    `L ${lastPoint.x} ${height - paddingY} ` +
    `L ${firstPoint.x} ${height - paddingY} Z`;
  return (
    <View
      style={[
        styles.chart,
        {
          width,
          height,
        },
      ]}
    >
      <Svg
        width={width}
        height={height}
      >
        <Defs>
          <LinearGradient
            id="habitChartGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <Stop
              offset="0"
              stopColor={color}
              stopOpacity={0.22}
            />
            <Stop
              offset="1"
              stopColor={color}
              stopOpacity={0}
            />
          </LinearGradient>
        </Defs>
        <Line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Path
          d={areaPath}
          fill="url(#habitChartGradient)"
        />
        <Path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3.5}
          fill={colors.surface}
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}
// =========================
// EKRAN
// =========================
export default function HabitDetailsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();
  const habitId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;
  const {
    habits,
    isLoading:
      habitsLoading,
  } = useHabits();
  const {
    entries,
    isLoading:
      entriesLoading,
  } = useHabitEntries();
  // =========================
  // NAWYK
  // =========================
  const habit =
    useMemo(
      () =>
        habits.find(
          (item) =>
            item.id ===
            habitId
        ),
      [
        habits,
        habitId,
      ]
    );
  // =========================
  // WYGLĄD
  // =========================
  const habitColor =
    useMemo(
      () => {
        if (
          !habit
        ) {
          return (
            habitColors[0]
          );
        }
        return habit.color;
      },
      [habit]
    );
  // =========================
  // DZISIAJ
  // =========================
  const today =
    useMemo(
      () =>
        startOfDay(
          new Date()
        ),
      []
    );
  // =========================
  // OSTATNIE 7 DNI
  // =========================
  const currentRange =
    useMemo(
      () => ({
        start: addDays(
          today,
          -6
        ),
        end: today,
      }),
      [today]
    );
  // =========================
  // POPRZEDNIE 7 DNI
  // =========================
  const previousRange =
    useMemo(
      () => ({
        start: addDays(
          today,
          -13
        ),
        end: addDays(
          today,
          -7
        ),
      }),
      [today]
    );
  // =========================
  // STATYSTYKI
  // =========================
  const currentStats =
    useMemo(
      () => {
        if (
          !habit
        ) {
          return {
            expected: 0,
            completed: 0,
            successRate: 0,
            activeDays: 0,
          };
        }
        return calculateProgressStats(
          [habit],
          entries,
          currentRange
        );
      },
      [
        habit,
        entries,
        currentRange,
      ]
    );
  const previousStats =
    useMemo(
      () => {
        if (
          !habit
        ) {
          return {
            expected: 0,
            completed: 0,
            successRate: 0,
            activeDays: 0,
          };
        }
        return calculateProgressStats(
          [habit],
          entries,
          previousRange
        );
      },
      [
        habit,
        entries,
        previousRange,
      ]
    );
  const trend =
    useMemo(
      () =>
        getTrendText(
          currentStats.successRate,
          previousStats.successRate
        ),
      [
        currentStats.successRate,
        previousStats.successRate,
      ]
    );
  // =========================
  // WSZYSTKIE WYKONANIA
  // =========================
  const habitEntries =
    useMemo(
      () =>
        entries.filter(
          (entry) =>
            entry.habitId ===
              habitId &&
            entry.completed
        ),
      [
        entries,
        habitId,
      ]
    );
  const totalCompleted =
    habitEntries.length;
  // =========================
  // AKTYWNOŚĆ — 26 TYGODNI
  // =========================
  const activityStats =
    useMemo(
      () => {
        if (!habit) {
          return {
            expected: 0,
            completed: 0,
            successRate: 0,
            activeDays: 0,
          };
        }
        const dayOfWeek =
          today.getDay();
        const daysSinceMonday =
          (dayOfWeek + 6) % 7;
        const activityStart =
          addDays(
            today,
            -(
              25 * 7 +
              daysSinceMonday
            )
          );
        return calculateProgressStats(
          [habit],
          entries,
          {
            start: activityStart,
            end: today,
          }
        );
      },
      [
        habit,
        entries,
        today,
      ]
    );
  // =========================
  // ŚREDNIA DZIENNA
  // =========================
  const averageDaily =
    currentStats.expected >
    0
      ? currentStats.completed /
        7
      : 0;
  // =========================
  // PASSA
  // =========================
  const streak =
    useMemo(
      () => {
        if (
          !habit
        ) {
          return 0;
        }
        let result = 0;
        let cursor =
          startOfDay(
            today
          );
        const completedDates =
          new Set(
            habitEntries.map(
              (entry) =>
                entry.date
            )
          );
        for (let index = 0; index < 3650; index += 1) {
          const key =
            getDateKey(
              cursor
            );
          const scheduled =
            habit.frequency.type === "timesPerWeek"
              ? isHabitAliveOnDate(habit, cursor)
              : isScheduledDay(habit, cursor);
          if (!scheduled) {
            cursor = addDays(cursor, -1);
            continue;
          }
          if (
            completedDates.has(
              key
            )
          ) {
            result += 1;
            cursor =
              addDays(
                cursor,
                -1
              );
            continue;
          }
          // A missing completion today does not break the current streak.
          if (key === getDateKey(today)) {
            cursor =
              addDays(
                cursor,
                -1
              );
            continue;
          }
          break;
        }
        return result;
      },
      [
        habit,
        habitEntries,
        today,
      ]
    );
  // =========================
  // MINI WYKRES
  // =========================
  const chartValues =
    useMemo(
      () => {
        if (
          !habit
        ) {
          return [];
        }
        const values: number[] =
          [];
        for (
          let offset =
            CHART_DAYS - 1;
          offset >= 0;
          offset -= 1
        ) {
          const date =
            addDays(
              today,
              -offset
            );
          const stats =
            calculateProgressStats(
              [habit],
              entries,
              {
                start: date,
                end: date,
              }
            );
          values.push(
            stats.successRate
          );
        }
        return values;
      },
      [
        habit,
        entries,
        today,
      ]
    );
  // =========================
  // EDYCJA
  // =========================
  const openEdit =
    () => {
      if (
        !habitId
      ) {
        return;
      }
      router.push({
        pathname:
          "/edit-habit/[id]",
        params: {
          id: habitId,
        },
      });
    };
  // =========================
  // LOADING
  // =========================
  if (
    habitsLoading ||
    entriesLoading
  ) {
    return (
      <SafeAreaView
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <Text
            style={
              styles.loadingText
            }
          >
            Ładowanie...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  // =========================
  // BRAK NAWYKU
  // =========================
  if (
    !habit
  ) {
    return (
      <SafeAreaView
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.topBar
          }
        >
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={
              styles.backButton
            }
          >
            <Text
              style={
                styles.backIcon
              }
            >
              ‹
            </Text>
          </Pressable>
        </View>
        <View
          style={
            styles.center
          }
        >
          <Text
            style={
              styles.notFoundTitle
            }
          >
            Nie znaleziono nawyku
          </Text>
          <Text
            style={
              styles.notFoundText
            }
          >
            Nawyk mógł zostać
            usunięty.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  // =========================
  // RENDER
  // =========================
  return (
    <SafeAreaView
      style={styles.screen}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* ===================== */}
      {/* TOP BAR */}
      {/* ===================== */}
      <View
        style={
          styles.topBar
        }
      >
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={
            styles.backButton
          }
        >
          <Text
            style={
              styles.backIcon
            }
          >
            ‹
          </Text>
        </Pressable>
        <Text
          style={
            styles.topTitle
          }
        >
          Szczegóły
        </Text>
        <Pressable
          onPress={
            openEdit
          }
          style={
            styles.editButton
          }
        >
          <Text
            style={[
              styles.editButtonText,
              {
                color:
                  habitColor.primary,
              },
            ]}
          >
            Edytuj
          </Text>
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* =================== */}
        {/* HERO CARD */}
        {/* =================== */}
        <View
          style={[
            styles.heroCard,
            {
              borderColor:
                habitColor.light,
            },
          ]}
        >
          {/* ================= */}
          {/* KOLOROWY HEADER */}
          {/* ================= */}
          <View
            style={[
              styles.heroHeader,
              {
                backgroundColor:
                  habitColor.light,
              },
            ]}
          >
            <View
              style={
                styles.habitIdentity
              }
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      colors.surface,
                  },
                ]}
              >
                <HabitIcon
                  name={habit.icon}
                  size={30}
                  color={habitColor.primary}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.habitName,
                  {
                    color:
                      habitColor.primary,
                  },
                ]}
              >
                {habit.name}
              </Text>
            </View>
            <View
              style={
                styles.streakContainer
              }
            >
              <Text
                style={
                  styles.fireIcon
                }
              >
                🔥
              </Text>
              <Text
                style={[
                  styles.streakValue,
                  {
                    color:
                      habitColor.primary,
                  },
                ]}
              >
                {streak}d
              </Text>
            </View>
          </View>
          {/* ================= */}
          {/* GŁÓWNA CZĘŚĆ */}
          {/* ================= */}
          <View
            style={
              styles.heroBody
            }
          >
            <View
              style={
                styles.scoreRow
              }
            >
              <View
                style={
                  styles.scoreArea
                }
              >
                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  OSTATNIE 7 DNI
                </Text>
                <View
                  style={
                    styles.scoreValueRow
                  }
                >
                  <Text
                    style={
                      styles.scoreValue
                    }
                  >
                    {
                      currentStats.successRate
                    }
                    %
                  </Text>
                  <View
                    style={
                      styles.trendRow
                    }
                  >
                    <Text
                      style={[
                        styles.trendArrow,
                        trend.direction ===
                          "up" &&
                          styles.trendUp,
                        trend.direction ===
                          "down" &&
                          styles.trendDown,
                      ]}
                    >
                      {trend.direction ===
                      "up"
                        ? "↑"
                        : trend.direction ===
                            "down"
                          ? "↓"
                          : "→"}
                    </Text>
                    <Text
                      style={[
                        styles.trendValue,
                        trend.direction ===
                          "up" &&
                          styles.trendUp,
                        trend.direction ===
                          "down" &&
                          styles.trendDown,
                      ]}
                    >
                      {trend.value}
                    </Text>
                  </View>
                </View>
              </View>
              <MiniChart
                values={
                  chartValues
                }
                color={
                  habitColor.primary
                }
                styles={styles}
                colors={colors}
              />
            </View>
            <View
              style={
                styles.divider
              }
            />
            {/* ================= */}
            {/* 3 STATYSTYKI */}
            {/* ================= */}
            <View
              style={
                styles.statsRow
              }
            >
              <View
                style={
                  styles.statItem
                }
              >
                <Text
                  style={
                    styles.statLabel
                  }
                >
                  WYKONANIE
                </Text>
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    currentStats.completed
                  }
                  /
                  {
                    currentStats.expected
                  }
                </Text>
              </View>
              <View
                style={
                  styles.statItem
                }
              >
                <Text
                  style={
                    styles.statLabel
                  }
                >
                  RAZEM
                </Text>
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    totalCompleted
                  }{" "}
                  razy
                </Text>
              </View>
              <View
                style={
                  styles.statItem
                }
              >
                <Text
                  style={
                    styles.statLabel
                  }
                >
                  ŚR. DZIENNA
                </Text>
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {averageDaily.toLocaleString(
                    "pl-PL",
                    {
                      minimumFractionDigits:
                        1,
                      maximumFractionDigits:
                        1,
                    }
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* =================== */}
        {/* PODSUMOWANIE */}
        {/* =================== */}
        <Text
          style={
            styles.groupTitle
          }
        >
          PODSUMOWANIE
        </Text>
        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryRow
            }
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    habitColor.light,
                },
              ]}
            >
              <HabitIcon
                name="Flame"
                size={18}
                color={habitColor.primary}
              />
            </View>
            <View
              style={
                styles.summaryText
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Aktualna passa
              </Text>
              <Text
                style={
                  styles.summaryDescription
                }
              >
                Kolejne dni z
                wykonanym nawykiem
              </Text>
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    habitColor.primary,
                },
              ]}
            >
              {streak} dni
            </Text>
          </View>
          <View
            style={
              styles.summarySeparator
            }
          />
          <View
            style={
              styles.summaryRow
            }
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    habitColor.light,
                },
              ]}
            >
              <HabitIcon
                name="CircleCheck"
                size={18}
                color={habitColor.primary}
              />
            </View>
            <View
              style={
                styles.summaryText
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Wszystkie wykonania
              </Text>
              <Text
                style={
                  styles.summaryDescription
                }
              >
                Od utworzenia
                nawyku
              </Text>
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    habitColor.primary,
                },
              ]}
            >
              {totalCompleted}
            </Text>
          </View>
        </View>
        {/* =================== */}
        {/* =================== */}
        {/* AKTYWNOŚĆ */}
        {/* =================== */}
        <View
          style={
            styles.activityTitleRow
          }
        >
          <Text
            style={[
              styles.groupTitle,
              styles.activityGroupTitle,
            ]}
          >
            AKTYWNOŚĆ
          </Text>
          <Text
            style={
              styles.activityRange
            }
          >
            6 MIESIĘCY
          </Text>
        </View>
        <View
          style={
            styles.activityCard
          }
        >
          <HabitActivityGrid
            habit={habit}
            entries={entries}
          />
          <View
            style={
              styles.activityDivider
            }
          />
          <View
            style={
              styles.activityStatsRow
            }
          >
            <View
              style={
                styles.activityStat
              }
            >
              <Text
                style={
                  styles.activityStatLabel
                }
              >
                SKUTECZNOŚĆ
              </Text>
              <Text
                style={[
                  styles.activityStatValue,
                  {
                    color:
                      habitColor.primary,
                  },
                ]}
              >
                {activityStats.successRate}%
              </Text>
            </View>
            <View
              style={
                styles.activityStat
              }
            >
              <Text
                style={
                  styles.activityStatLabel
                }
              >
                WYKONANIA
              </Text>
              <Text
                style={[
                  styles.activityStatValue,
                  {
                    color:
                      habitColor.primary,
                  },
                ]}
              >
                {activityStats.completed}
              </Text>
            </View>
            <View
              style={
                styles.activityStat
              }
            >
              <Text
                style={
                  styles.activityStatLabel
                }
              >
                PLAN
              </Text>
              <Text
                style={[
                  styles.activityStatValue,
                  {
                    color:
                      habitColor.primary,
                  },
                ]}
              >
                {activityStats.expected}
              </Text>
            </View>
          </View>
        </View>
        {/* =================== */}
        {/* HISTORIA */}
        {/* =================== */}
        <Text
          style={
            styles.groupTitle
          }
        >
          HISTORIA
        </Text>
        <View
          style={
            styles.placeholderCard
          }
        >
          <View
            style={[
              styles.placeholderIcon,
              {
                backgroundColor:
                  habitColor.light,
              },
            ]}
          >
            <Text
              style={
                styles.placeholderEmoji
              }
            >
              🗓️
            </Text>
          </View>
          <Text
            style={
              styles.placeholderTitle
            }
          >
            Historia wykonań
          </Text>
          <Text
            style={
              styles.placeholderText
            }
          >
            W kolejnym kroku
            dodamy tutaj listę
            wykonanych i pominiętych
            dni tego nawyku.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
// =========================
// STYLE
// =========================
function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.background,
    },
    content: {
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 40,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    // =====================
    // TOP BAR
    // =====================
    topBar: {
      height: 54,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: "center",
      justifyContent:
        "center",
    },
    backIcon: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "400",
      lineHeight: 30,
      marginTop: -2,
    },
    topTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    editButton: {
      minWidth: 58,
      height: 38,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent:
        "center",
    },
    editButtonText: {
      fontSize: 13,
      fontWeight: "700",
    },
    // =====================
    // HERO
    // =====================
    heroCard: {
      backgroundColor:
        colors.surface,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
    },
    heroHeader: {
      minHeight: 86,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },
    habitIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    iconContainer: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },
    habitIcon: {
      fontSize: 23,
    },
    habitName: {
      flex: 1,
      fontSize: 22,
      fontWeight: "800",
    },
    streakContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    fireIcon: {
      fontSize: 17,
      marginRight: 5,
    },
    streakValue: {
      fontSize: 19,
      fontWeight: "800",
    },
    heroBody: {
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 18,
    },
    scoreRow: {
      minHeight: 95,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },
    scoreArea: {
      flex: 1,
      paddingRight: 10,
    },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.7,
      marginBottom: 9,
    },
    scoreValueRow: {
      flexDirection: "row",
      alignItems:
        "flex-end",
    },
    scoreValue: {
      color: colors.text,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: "800",
      letterSpacing: -1.3,
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 9,
      marginBottom: 5,
    },
    trendArrow: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "800",
      marginRight: 2,
    },
    trendValue: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "800",
    },
    trendUp: {
      color: colors.success,
    },
    trendDown: {
      color: colors.danger,
    },
    // =====================
    // MINI CHART
    // =====================
    chart: {
      position: "relative",
      overflow: "hidden",
    },
    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginTop: 14,
      marginBottom: 17,
    },
    // =====================
    // STATS
    // =====================
    statsRow: {
      flexDirection: "row",
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
      marginBottom: 7,
    },
    statValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "800",
    },
    // =====================
    // GROUP
    // =====================
    groupTitle: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.7,
      marginTop: 24,
      marginBottom: 9,
      marginLeft: 4,
    },
    // =====================
    // SUMMARY
    // =====================
    summaryCard: {
      backgroundColor:
        colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        colors.border,
      paddingHorizontal: 15,
    },
    summaryRow: {
      minHeight: 75,
      flexDirection: "row",
      alignItems: "center",
    },
    summaryIcon: {
      width: 39,
      height: 39,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },
    summaryText: {
      flex: 1,
      paddingRight: 10,
    },
    summaryLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    summaryDescription: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 3,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: "800",
    },
    summarySeparator: {
      height: 1,
      backgroundColor:
        colors.border,
      marginLeft: 51,
    },
    // =====================
    // ACTIVITY
    // =====================
    activityTitleRow: {
      marginTop: 24,
      marginBottom: 9,
      paddingHorizontal: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    activityGroupTitle: {
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
    activityRange: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.6,
    },
    activityCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      paddingTop: 4,
      paddingBottom: 16,
    },
    activityDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
      marginTop: 4,
      marginBottom: 16,
    },
    activityStatsRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
    },
    activityStat: {
      flex: 1,
    },
    activityStatLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    activityStatValue: {
      fontSize: 18,
      fontWeight: "800",
    },
    // =====================
    // PLACEHOLDER
    // =====================
    placeholderCard: {
      minHeight: 180,
      backgroundColor:
        colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 35,
      paddingVertical: 25,
    },
    placeholderIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 12,
    },
    placeholderEmoji: {
      fontSize: 20,
    },
    placeholderTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    placeholderText: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      textAlign: "center",
      marginTop: 6,
    },
    // =====================
    // NOT FOUND
    // =====================
    notFoundTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    notFoundText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 6,
    },
    });
}
