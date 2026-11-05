import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useMemo,
  useState,
} from "react";
import { useHabits } from "../../context/HabitsContext";
import { useHabitEntries } from "../../context/HabitEntriesContext";
import { useRoutines } from "../../context/RoutinesContext";
import { useRoutineEntries } from "../../context/RoutineEntriesContext";
import ProgressHabitBreakdown from "../../components/ProgressHabitBreakdown";
import type { ProgressBreakdownRow } from "../../components/ProgressHabitBreakdown";
import ProgressRegularityChart from "../../components/ProgressRegularityChart";
import ProgressVolumeChart from "../../components/ProgressVolumeChart";
import type { ProgressVolumePoint } from "../../components/ProgressVolumeChart";
import ProgressActivityHeatmap from "../../components/ProgressActivityHeatmap";
import {
  addDays,
  calculateDailyProgressStats,
  calculateHabitBestStreak,
  calculateProgressStats,
  differenceInDays,
  getDateKey,
  eachDay,
  getHabitStart,
  minDate,
  parseDateKey,
  parseDateTime,
  startOfDay,
  startOfWeekMonday,
} from "../../utils/progress-stats";
import {
  calculateRoutineDailyProgressStats,
  calculateRoutineProgressStats,
} from "../../utils/routine-progress-stats";
import {
  AppThemeColors,
  useTheme,
} from "../../context/ThemeContext";
// =========================
// TYPY
// =========================
type Period =
  | "week"
  | "month"
  | "all";
type ProgressView = "habits" | "routines";
type Range = {
  start: Date;
  end: Date;
};
// =========================
// STAŁE
// =========================
// =========================
// DATY
// =========================
function createProgressBuckets(range: Range) {
  const totalDays =
    differenceInDays(range.end, range.start) + 1;
  const bucketCount = Math.min(7, Math.max(1, totalDays));
  const bucketSize = Math.ceil(totalDays / bucketCount);
  const buckets: Range[] = [];

  for (let index = 0; index < bucketCount; index++) {
    const start = addDays(range.start, index * bucketSize);
    if (start > range.end) {
      break;
    }
    buckets.push({
      start,
      end: minDate(
        addDays(start, bucketSize - 1),
        range.end
      ),
    });
  }

  return buckets;
}
function createPeriodChartBuckets(
  range: Range,
  period: Period
): Range[] {
  if (period === "week") {
    return eachDay(range.start, range.end).map((date) => ({
      start: date,
      end: date,
    }));
  }

  if (period === "month") {
    const buckets: Range[] = [];
    let bucketStart = range.start;
    while (bucketStart <= range.end) {
      const weekEnd = addDays(startOfWeekMonday(bucketStart), 6);
      const bucketEnd = minDate(weekEnd, range.end);
      buckets.push({ start: bucketStart, end: bucketEnd });
      bucketStart = addDays(bucketEnd, 1);
    }
    return buckets;
  }

  const totalDays = differenceInDays(range.end, range.start) + 1;
  const bucketCount = Math.min(7, Math.max(1, Math.ceil(totalDays / 7)));
  const bucketSize = Math.ceil(totalDays / bucketCount);
  const buckets: Range[] = [];
  for (let index = 0; index < bucketCount; index += 1) {
    const start = addDays(range.start, index * bucketSize);
    if (start > range.end) {
      break;
    }
    buckets.push({
      start,
      end: minDate(addDays(start, bucketSize - 1), range.end),
    });
  }
  return buckets;
}
function getPeriodBucketLabel(
  bucket: Range,
  index: number,
  period: Period
) {
  if (period === "week") {
    return ["N", "P", "W", "Ś", "C", "P", "S"][bucket.start.getDay()];
  }
  if (period === "month") {
    return `${bucket.start.getDate()}-${bucket.end.getDate()}`;
  }
  return `${index + 1}`;
}
function getDateAxisLabel(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}
// =========================
// ŻYCIE NAWYKU
// =========================
// =========================
// HARMONOGRAM
// =========================
// =========================
// WPIS WYKONANIA
// =========================
// =========================
// X RAZY W TYGODNIU
// =========================
// =========================
// STATYSTYKI OKRESU
// =========================



function calculateSuccessRateFromCounts(stats: {
  expected: number;
  completed: number;
}) {
  return stats.expected > 0
    ? Math.min(
        100,
        Math.round(
          (stats.completed /
            stats.expected) *
            100
        )
      )
    : 0;
}
// =========================
// TREND
// =========================
function calculateChange(
  current: number,
  previous: number
) {
  // Różnica bezwzględna: unika zawyżonych wartości, gdy poprzedni okres był prawie pusty.
  return Math.round(current - previous);
}
function Trend({
  value,
  styles,
  suffix = "%",
}: {
  value: number;
  styles: ReturnType<typeof createStyles>;
  suffix?: string;
}) {
  if (
    value === 0
  ) {
    return (
      <Text
        style={
          styles.trendNeutral
        }
      >
        — 0{suffix}
      </Text>
    );
  }
  const positive =
    value > 0;
  return (
    <Text
      style={
        positive
          ? styles.trendPositive
          : styles.trendNegative
      }
    >
      {positive
        ? "↑"
        : "↓"}{" "}
      {Math.abs(
        value
      )}{suffix}
    </Text>
  );
}
// =========================
// EKRAN
// =========================
export default function ProgressScreen() {
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);
  const {
    habits,
  } = useHabits();
  const {
    entries,
  } = useHabitEntries();
  const { routines } = useRoutines();
  const { entries: routineEntries } = useRoutineEntries();
  const [progressView, setProgressView] =
    useState<ProgressView>("habits");
  const [habitsHeatmapCollapsed, setHabitsHeatmapCollapsed] =
    useState(false);
  const [routinesHeatmapCollapsed, setRoutinesHeatmapCollapsed] =
    useState(false);
  const [
    period,
    setPeriod,
  ] = useState<Period>(
    "week"
  );
  // =========================
  // ZAKRES
  // =========================
  const ranges =
    useMemo(() => {
      const today =
        startOfDay(
          new Date()
        );
      let days = 7;
      if (
        period ===
        "month"
      ) {
        days = 30;
      }
      // =====================
      // CAŁY OKRES
      // =====================
      if (
        period === "all"
      ) {
        const habitDates =
          habits
            .map(
              (habit) =>
                getHabitStart(
                  habit
                )
            )
            .filter(
              (date) =>
                !Number.isNaN(
                  date.getTime()
                )
            );
        const entryDates =
          entries
            .map(
              (entry) =>
                parseDateKey(
                  entry.date
                )
            )
            .filter(
              (date) =>
                !Number.isNaN(
                  date.getTime()
                )
            );
        const allDates = [
          ...habitDates,
          ...entryDates,
        ];
        const start =
          allDates.length > 0
            ? new Date(
                Math.min(
                  ...allDates.map(
                    (date) =>
                      date.getTime()
                  )
                )
              )
            : today;
        return {
          active: {
            start:
              startOfDay(
                start
              ),
            end: today,
          },
          previous: null,
        };
      }
      // =====================
      // TYDZIEŃ / MIESIĄC
      // =====================
      const currentStart =
        addDays(
          today,
          -(days - 1)
        );
      const previousEnd =
        addDays(
          currentStart,
          -1
        );
      const previousStart =
        addDays(
          previousEnd,
          -(days - 1)
        );
      return {
        active: {
          start:
            currentStart,
          end: today,
        },
        previous: {
          start:
            previousStart,
          end:
            previousEnd,
        },
      };
    }, [
      period,
      habits,
      entries,
    ]);
  // =========================
  // STATYSTYKI
  // =========================
  const currentStats =
    useMemo(
      () =>
        calculateProgressStats(
          habits,
          entries,
          ranges.active
        ),
      [
        habits,
        entries,
        ranges,
      ]
    );
  const activePeriodDays =
    differenceInDays(
      ranges.active.end,
      ranges.active.start
    ) + 1;
  const previousStats =
    useMemo(() => {
      if (
        !ranges.previous
      ) {
        return null;
      }
      return calculateProgressStats(
        habits,
        entries,
        ranges.previous
      );
    }, [
      habits,
      entries,
      ranges,
    ]);
  // =========================
  // TRENDY
  // =========================
  const successTrend =
    previousStats
      ? calculateChange(
          currentStats.successRate,
          previousStats.successRate
        )
      : null;
  const completedTrend =
    previousStats
      ? calculateChange(
          currentStats.completed,
          previousStats.completed
        )
      : null;
  const activeDaysTrend =
    previousStats
      ? calculateChange(
          currentStats.activeDays,
          previousStats.activeDays
        )
      : null;
  // =========================
  // NAJLEPSZA PASSA
  // =========================
  const bestStreak =
    useMemo(() => {
      const completedDates =
        new Set(
          entries
            .filter(
              (entry) =>
                entry.completed
            )
            .filter(
              (entry) =>
                habits.some(
                  (habit) =>
                    habit.id ===
                    entry.habitId
                )
            )
            .map(
              (entry) =>
                entry.date
            )
        );
      if (
        completedDates.size ===
        0
      ) {
        return 0;
      }
      const sortedDates =
        Array.from(
          completedDates
        ).sort();
      let best = 1;
      let current = 1;
      for (
        let index = 1;
        index <
        sortedDates.length;
        index++
      ) {
        const previousDate =
          parseDateKey(
            sortedDates[
              index - 1
            ]
          );
        const currentDate =
          parseDateKey(
            sortedDates[
              index
            ]
          );
        const difference =
          differenceInDays(
            currentDate,
            previousDate
          );
        if (
          difference === 1
        ) {
          current += 1;
          best =
            Math.max(
              best,
              current
            );
        } else {
          current = 1;
        }
      }
      return best;
    }, [
      entries,
      habits,
    ]);
  // =========================
  // WYKRES REGULARNOŚCI
  // =========================
  const chartBuckets = useMemo(
    () => createPeriodChartBuckets(ranges.active, period),
    [period, ranges.active]
  );
  const regularityChartData = useMemo(
    () =>
      chartBuckets.map((bucket, index) => {
        const stats =
          period === "week"
            ? calculateDailyProgressStats(
                habits,
                entries,
                bucket.start
              )
            : calculateProgressStats(
                habits,
                entries,
                bucket
              );
        return {
          label: getPeriodBucketLabel(bucket, index, period),
          value:
            stats.expected > 0
              ? calculateSuccessRateFromCounts(stats)
              : null,
        };
      }),
    [chartBuckets, period, habits, entries]
  );
  const volumeChartData = useMemo<ProgressVolumePoint[]>(
    () =>
      chartBuckets.map((bucket, index) => {
        const stats =
          period === "week"
            ? calculateDailyProgressStats(
                habits,
                entries,
                bucket.start
              )
            : calculateProgressStats(
                habits,
                entries,
                bucket
              );
        return {
          label: getPeriodBucketLabel(bucket, index, period),
          dateLabel:
            period === "week"
              ? getDateAxisLabel(bucket.start)
              : undefined,
          completed: stats.completed,
          missed: Math.max(0, stats.expected - stats.completed),
        };
      }),
    [chartBuckets, period, habits, entries]
  );
  const regularityPeriodLabel =
    period === "week"
      ? "7 DNI"
      : period === "month"
        ? "30 DNI"
        : "CAŁY OKRES";
  const habitBreakdownRows = useMemo<ProgressBreakdownRow[]>(() => {
    const range = ranges.active;
    const totalDays =
      differenceInDays(range.end, range.start) + 1;
    const buckets = createProgressBuckets(range);
    const todayStart = startOfDay(new Date());
    const todayKey = getDateKey(todayStart);
    const doneToday = new Set(
      entries
        .filter((entry) => entry.completed && entry.date === todayKey)
        .map((entry) => entry.habitId)
    );

    return habits.map((habit) => {
      const stats = calculateProgressStats(
        [habit],
        entries,
        range
      );

      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color.primary,
        iconBackground: habit.color.light,
        completed: stats.completed,
        expected: stats.expected,
        successRate: stats.successRate,
        bestStreak: calculateHabitBestStreak(habit, entries),
        streakUnit:
          habit.frequency.type === "timesPerWeek"
            ? "tyg."
            : "dni",
        averagePerDay:
          totalDays > 0
            ? stats.completed / totalDays
            : 0,
        trend: buckets.map((bucket) => {
          // Dzisiejszy, jeszcze nieodhaczony dzień nie jest porażką - dzień się nie skończył.
          const end =
            bucket.end >= todayStart && !doneToday.has(habit.id)
              ? addDays(todayStart, -1)
              : bucket.end;
          if (end < bucket.start) {
            return null;
          }
          const bucketStats = calculateProgressStats(
            [habit],
            entries,
            { start: bucket.start, end }
          );
          return bucketStats.expected > 0
            ? bucketStats.successRate
            : null;
        }),
      };
    });
  }, [habits, entries, ranges.active]);
  const routineRange: Range = (() => {
    const currentRange = ranges.active;
    if (period !== "all") {
      return currentRange;
    }

    const dates = [
      ...routines.map((routine) => parseDateTime(routine.createdAt)),
      ...routineEntries.map((entry) => parseDateKey(entry.date)),
    ].filter((date) => !Number.isNaN(date.getTime()));
    const start =
      dates.length > 0
        ? new Date(Math.min(...dates.map((date) => date.getTime())))
        : currentRange.end;

    return {
      start: startOfDay(start),
      end: currentRange.end,
    };
  })();
  const routineCurrentStats = useMemo(
    () =>
      calculateRoutineProgressStats(
        routines,
        routineEntries,
        routineRange
      ),
    [routines, routineEntries, routineRange]
  );
  const routinePreviousStats = useMemo(() => {
    if (!ranges.previous) {
      return null;
    }

    return calculateRoutineProgressStats(
      routines,
      routineEntries,
      ranges.previous
    );
  }, [routines, routineEntries, ranges.previous]);
  const routineSuccessTrend = routinePreviousStats
    ? calculateChange(
        routineCurrentStats.successRate,
        routinePreviousStats.successRate
      )
    : null;
  const routineStepsTrend = routinePreviousStats
    ? calculateChange(
        routineCurrentStats.completed,
        routinePreviousStats.completed
      )
    : null;
  const completedRoutinesTrend = routinePreviousStats
    ? calculateChange(
        routineCurrentStats.completedRoutines,
        routinePreviousStats.completedRoutines
      )
    : null;
  const routineBuckets = useMemo(
    () => createProgressBuckets(routineRange),
    [routineRange]
  );
  const routineChartBuckets = useMemo(
    () => createPeriodChartBuckets(routineRange, period),
    [period, routineRange]
  );
  const routineChartData = useMemo(
    () =>
      routineChartBuckets.map((bucket, index) => {
        const stats = calculateRoutineProgressStats(
          routines,
          routineEntries,
          bucket
        );
        return {
          label: getPeriodBucketLabel(bucket, index, period),
          value: stats.expected > 0 ? stats.successRate : null,
        };
      }),
    [period, routineChartBuckets, routines, routineEntries]
  );
  const routineVolumeChartData = useMemo<ProgressVolumePoint[]>(
    () =>
      routineChartBuckets.map((bucket, index) => {
        const stats = calculateRoutineProgressStats(
          routines,
          routineEntries,
          bucket
        );
        return {
          label: getPeriodBucketLabel(bucket, index, period),
          dateLabel:
            period === "week"
              ? getDateAxisLabel(bucket.start)
              : undefined,
          completed: stats.completed,
          missed: Math.max(0, stats.expected - stats.completed),
        };
      }),
    [period, routineChartBuckets, routines, routineEntries]
  );
  const routineBreakdownRows = useMemo<ProgressBreakdownRow[]>(() => {
    const totalDays =
      differenceInDays(routineRange.end, routineRange.start) + 1;

    return routines.flatMap((routine) => {
      const stats = calculateRoutineProgressStats(
        [routine],
        routineEntries,
        routineRange
      );
      if (stats.expected === 0 && stats.completed === 0) {
        return [];
      }

      return [{
        id: routine.id,
        name: routine.name,
        icon: routine.icon || "CircleCheck",
        color: routine.color,
        iconBackground: `${routine.color}18`,
        completed: stats.completed,
        expected: stats.expected,
        successRate: stats.successRate,
        averagePerDay: totalDays > 0 ? stats.completed / totalDays : 0,
        trend: routineBuckets.map((bucket) => {
          const bucketStats = calculateRoutineProgressStats(
            [routine],
            routineEntries,
            bucket
          );
          return bucketStats.expected > 0
            ? bucketStats.successRate
            : null;
        }),
      }];
    });
  }, [routines, routineEntries, routineRange, routineBuckets]);
  // =========================
  // HEATMAPA — 12 TYGODNI
  // =========================
  const heatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const currentWeekStart = startOfWeekMonday(today);
    const heatmapStart = addDays(currentWeekStart, -77);
    return eachDay(heatmapStart, today).map((date) =>
      calculateDailyProgressStats(habits, entries, date)
    );
  }, [habits, entries]);
  const routineHeatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const heatmapStart = addDays(startOfWeekMonday(today), -77);
    return eachDay(heatmapStart, today).map((date) =>
      calculateRoutineDailyProgressStats(routines, routineEntries, date)
    );
  }, [routines, routineEntries]);
  // =========================
  // UI
  // =========================
  return (
    <View style={styles.screen}>
    <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        edges={["top"]}
        style={
          styles.safeArea
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* ===================== */}
          {/* HEADER */}
          {/* ===================== */}
          <View
            style={
              styles.header
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              TWOJE WYNIKI
            </Text>
            <Text
              style={
                styles.title
              }
            >
              Postęp
            </Text>
            <Text
              style={
                styles.subtitle
              }
            >
              Zobacz, jak zmienia
              się Twoja regularność.
            </Text>
          </View>
          {/* ===================== */}
          {/* OKRES */}
          {/* ===================== */}
          <View
            style={
              styles.periodSelector
            }
          >
            <Pressable
              onPress={() =>
                setPeriod(
                  "week"
                )
              }
              style={[
                styles.periodButton,
                period ===
                  "week" &&
                  styles.periodButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  period ===
                    "week" &&
                    styles.periodTextActive,
                ]}
              >
                1 tydzień
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setPeriod(
                  "month"
                )
              }
              style={[
                styles.periodButton,
                period ===
                  "month" &&
                  styles.periodButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  period ===
                    "month" &&
                    styles.periodTextActive,
                ]}
              >
                1 miesiąc
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setPeriod(
                  "all"
                )
              }
              style={[
                styles.periodButton,
                period ===
                  "all" &&
                  styles.periodButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  period ===
                    "all" &&
                    styles.periodTextActive,
                ]}
              >
                Cały okres
              </Text>
            </Pressable>
          </View>
          <View style={styles.progressViewSelector}>
            {(
              [
                { key: "habits", label: "Nawyki" },
                { key: "routines", label: "Rutyny" },
              ] as const
            ).map((option) => {
              const selected = progressView === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setProgressView(option.key)}
                  style={[
                    styles.progressViewButton,
                    selected && styles.progressViewButtonActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.progressViewText,
                      selected && styles.progressViewTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {progressView === "habits" ? (
            <>
          {/* ===================== */}
          {/* SKUTECZNOŚĆ */}
          {/* ===================== */}
          <View
            style={
              styles.mainCard
            }
          >
            <View
              style={
                styles.mainCardTop
              }
            >
              <View>
                <Text
                  style={
                    styles.cardLabel
                  }
                >
                  SKUTECZNOŚĆ
                </Text>
                <View
                  style={
                    styles.valueRow
                  }
                >
                  <Text
                    style={
                      styles.mainValue
                    }
                  >
                    {
                      currentStats.successRate
                    }%
                  </Text>
                  {successTrend !== null && (
                    <Trend value={successTrend} styles={styles} />
                  )}
                </View>
              </View>
            </View>
            <Text
              style={
                styles.mainDescription
              }
            >
              {
                currentStats.completed
              }{" "}
              z{" "}
              {
                currentStats.expected
              }{" "}
              zaplanowanych wykonań
              w wybranym okresie.
            </Text>
          </View>
          {/* ===================== */}
          {/* STATYSTYKI */}
          {/* ===================== */}
          <View
            style={
              styles.statsGrid
            }
          >
            <View
              style={
                styles.statCard
              }
            >
              <Text
                style={
                  styles.cardLabel
                }
              >
                WYKONANE
              </Text>
              <View
                style={
                  styles.statValueRow
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    currentStats.completed
                  }
                </Text>
                {completedTrend !==
                  null && (
                  <Trend
                    value={
                      completedTrend
                    }
                      styles={styles}
                  />
                )}
              </View>
              <Text
                style={
                  styles.statDescription
                }
              >
                z{" "}
                {
                  currentStats.expected
                }{" "}
                zaplanowanych
              </Text>
            </View>
            <View
              style={
                styles.statCard
              }
            >
              <Text
                style={
                  styles.cardLabel
                }
              >
                AKTYWNE DNI
              </Text>
              <View
                style={
                  styles.statValueRow
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    currentStats.activeDays
                  }
                </Text>
                {activeDaysTrend !==
                  null && (
                  <Trend
                    value={
                      activeDaysTrend
                    }
                      styles={styles}
                  />
                )}
              </View>
              <Text
                style={
                  styles.statDescription
                }
              >
                z {activePeriodDays} dni w okresie
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.cardLabel}>POMINIĘTE</Text>
              <View style={styles.statValueRow}>
                <Text
                  style={[
                    styles.statValue,
                    currentStats.expected > currentStats.completed &&
                      styles.statValueMissed,
                  ]}
                >
                  {Math.max(
                    0,
                    currentStats.expected - currentStats.completed
                  )}
                </Text>
              </View>
              <Text style={styles.statDescription} numberOfLines={2}>
                niewykonane z planu
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.cardLabel}>NAJLEPSZA PASSA</Text>
              <View style={styles.statValueRow}>
                <Text
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {bestStreak} {bestStreak === 1 ? "dzień" : "dni"}
                </Text>
              </View>
              <Text style={styles.statDescription} numberOfLines={1}>
                z rzędu
              </Text>
            </View>
          </View>

          <View style={styles.regularitySection}>
            <ProgressRegularityChart
              data={regularityChartData}
              averageValue={
                currentStats.expected > 0
                  ? currentStats.successRate
                  : null
              }
              periodLabel={regularityPeriodLabel}
            />
          </View>
          <ProgressVolumeChart
            data={volumeChartData}
            periodLabel={regularityPeriodLabel}
          />
          <ProgressHabitBreakdown
            rows={habitBreakdownRows}
            periodLabel={regularityPeriodLabel}
          />
          <View style={styles.heatmapSection}>
            <ProgressActivityHeatmap
              data={heatmapData}
              periodLabel="12 TYGODNI"
              collapsed={habitsHeatmapCollapsed}
              onToggleCollapsed={() =>
                setHabitsHeatmapCollapsed((current) => !current)
              }
            />
          </View>
            </>
          ) : (
            <>
              <View style={styles.mainCard}>
                <View style={styles.mainCardTop}>
                  <View>
                    <Text style={styles.cardLabel}>SKUTECZNOŚĆ</Text>
                    <View style={styles.valueRow}>
                      <Text style={styles.mainValue}>
                        {routineCurrentStats.successRate}%
                      </Text>
                      {routineSuccessTrend !== null && (
                        <Trend value={routineSuccessTrend} styles={styles} />
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.mainDescription}>
                  {routineCurrentStats.completed} z {routineCurrentStats.expected} zaplanowanych kroków.
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.cardLabel}>UKOŃCZONE RUTYNY</Text>
                  <View style={styles.statValueRow}>
                    <Text style={styles.statValue}>
                      {routineCurrentStats.completedRoutines}
                    </Text>
                    {completedRoutinesTrend !== null && (
                      <Trend value={completedRoutinesTrend} styles={styles} />
                    )}
                  </View>
                  <Text style={styles.statDescription}>
                    z {routineCurrentStats.scheduledRoutines} zaplanowanych
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.cardLabel}>WYKONANE KROKI</Text>
                  <View style={styles.statValueRow}>
                    <Text style={styles.statValue}>
                      {routineCurrentStats.completed}
                    </Text>
                    {routineStepsTrend !== null && (
                      <Trend value={routineStepsTrend} styles={styles} />
                    )}
                  </View>
                  <Text style={styles.statDescription}>
                    z {routineCurrentStats.expected} zaplanowanych
                  </Text>
                </View>
                <View style={[styles.statCard, styles.statCardWide]}>
                  <Text style={styles.cardLabel}>POMINIĘTE KROKI</Text>
                  <View style={styles.statValueRow}>
                    <Text
                      style={[
                        styles.statValue,
                        routineCurrentStats.expected >
                          routineCurrentStats.completed &&
                          styles.statValueMissed,
                      ]}
                    >
                      {Math.max(
                        0,
                        routineCurrentStats.expected -
                          routineCurrentStats.completed
                      )}
                    </Text>
                  </View>
                  <Text style={styles.statDescription}>
                    zaplanowane bez wykonania
                  </Text>
                </View>
              </View>

              <View style={styles.regularitySection}>
                <ProgressRegularityChart
                  data={routineChartData}
                  averageValue={
                    routineCurrentStats.expected > 0
                      ? routineCurrentStats.successRate
                      : null
                  }
                  periodLabel={regularityPeriodLabel}
                />
              </View>
              <ProgressVolumeChart
                data={routineVolumeChartData}
                periodLabel={regularityPeriodLabel}
              />

              <ProgressHabitBreakdown
                rows={routineBreakdownRows}
                periodLabel={regularityPeriodLabel}
                title="WYNIKI RUTYN"
              />

              <View style={styles.heatmapSection}>
                <ProgressActivityHeatmap
                  data={routineHeatmapData}
                  periodLabel="12 TYGODNI"
                  collapsed={routinesHeatmapCollapsed}
                  onToggleCollapsed={() =>
                    setRoutinesHeatmapCollapsed((current) => !current)
                  }
                />
              </View>
            </>
          )}
          <Text
            style={
              styles.footer
            }
          >
            {progressView === "habits"
              ? "Statystyki uwzględniają harmonogram, datę utworzenia oraz archiwizację nawyków."
              : "Rutyny archiwalne są liczone do ostatniego dnia zapisanej w nich aktywności."}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
// =========================
// STYLE
// =========================
function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  // =========================
  // SCREEN
  // =========================
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },
  // =========================
  // HEADER
  // =========================
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.9,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  // =========================
  // PERIOD SELECTOR
  // =========================
  periodSelector: {
    flexDirection: "row",
    backgroundColor:
      colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      colors.border,
    padding: 4,
    marginBottom: 14,
  },
  periodButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor:
      colors.surfaceSecondary,
    borderWidth: 1,
    borderColor:
      colors.border,
  },
  periodText: {
    color:
      colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  periodTextActive: {
    color:
      colors.text,
    fontWeight: "700",
  },
  progressViewSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  progressViewButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressViewButtonActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  progressViewText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  progressViewTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  // =========================
  // MAIN CARD
  // =========================
  mainCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor:
      colors.border,
    padding: 19,
    marginBottom: 10,
  },
  mainCardTop: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color:
      colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.9,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 9,
    marginTop: 5,
  },
  mainValue: {
    color:
      colors.text,
    fontSize: 39,
    lineHeight: 45,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  mainDescription: {
    color:
      colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 11,
  },
  // =========================
  // TREND
  // =========================
  trendPositive: {
    color:
      colors.success,
    fontSize: 10,
    fontWeight: "700",
  },
  trendNegative: {
    color:
      colors.danger,
    fontSize: 10,
    fontWeight: "700",
  },
  trendNeutral: {
    color:
      colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  // =========================
  // STATS GRID
  // =========================
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "48%",
    minWidth: 0,
    backgroundColor:
      colors.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor:
      colors.border,
    padding: 12,
    minHeight: 108,
  },
  statCardWide: {
    flexBasis: "100%",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
    marginTop: 8,
  },
  statValue: {
    color:
      colors.text,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statValueMissed: {
    color: colors.danger,
  },
  statDescription: {
    color:
      colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  // =========================
  // STREAK
  // =========================
  streakCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor:
      colors.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  streakIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      `${colors.success}20`,
    borderWidth: 1,
    borderColor:
      `${colors.success}45`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  streakIconText: {
    color:
      colors.success,
    fontSize: 20,
    fontWeight: "800",
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    color:
      colors.text,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 3,
  },
  // =========================
  // CHART / HEATMAP
  // =========================
  regularitySection: {
    marginBottom: 25,
  },
  heatmapSection: {
    marginBottom: 25,
  },
  // =========================
  // ACTIVITY
  // =========================
  sectionLabel: {
    color:
      colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
    marginBottom: 9,
  },
  activityCard: {
    backgroundColor:
      colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      colors.border,
    paddingHorizontal: 12,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent:
      "space-between",
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    color:
      colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 8,
  },
  activityDot: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor:
      colors.surfaceSecondary,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  activityDotActive: {
    backgroundColor:
      colors.success,
    borderColor:
      colors.success,
  },
  activityNumber: {
    color:
      colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  activityNumberActive: {
    color:
      "#101014",
  },
  // =========================
  // FOOTER
  // =========================
  footer: {
    color:
      colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 30,
  },
  });
}
