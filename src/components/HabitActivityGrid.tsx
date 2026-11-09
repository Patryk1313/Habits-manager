import { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Habit } from "../types/habit";
import { HabitEntry } from "../types/habit-entry";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
// =========================
// PROPS
// =========================
type Props = {
  habit: Habit;
  entries: HabitEntry[];
};
// =========================
// USTAWIENIA
// =========================
const NUMBER_OF_WEEKS = 26;
const CELL_SIZE = 13;
const CELL_GAP = 4;
const DAY_LABEL_WIDTH = 26;
// =========================
// TYP DNIA
// =========================
type ActivityDay = {
  date: Date;
  dateKey: string;
  completed: boolean;
  skipped: boolean;
  isToday: boolean;
};
// =========================
// DATA → YYYY-MM-DD
// =========================
function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// =========================
// POCZĄTEK TYGODNIA
// PONIEDZIAŁEK
// =========================
function getWeekStart(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const difference =
    day === 0
      ? -6
      : 1 - day;
  result.setDate(
    result.getDate() + difference
  );
  return result;
}
// =========================
// SKRÓT MIESIĄCA
// =========================
function getMonthLabel(date: Date) {
  const month =
    date.toLocaleDateString(
      "pl-PL",
      {
        month: "short",
      }
    );
  return (
    month.charAt(0).toUpperCase() +
    month.slice(1).replace(".", "")
  );
}
// =========================
// COMPONENT
// =========================
export default function HabitActivityGrid({
  habit,
  entries,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  // =========================
  // SCROLL
  // =========================
  const scrollRef =
    useRef<ScrollView>(null);
  const hasScrolledToEnd =
    useRef(false);
  const scrollToLatest = () => {
    if (
      hasScrolledToEnd.current
    ) {
      return;
    }
    hasScrolledToEnd.current =
      true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({
        animated: false,
      });
    });
  };
  // =========================
  // DZISIAJ
  // =========================
  const today = new Date();
  today.setHours(
    0,
    0,
    0,
    0
  );
  const todayKey =
    getDateKey(today);
  // =========================
  // WYKONANE DNI
  // =========================
  const completedDates =
    new Set(
      entries
        .filter(
          (entry) =>
            entry.habitId ===
              habit.id &&
            entry.completed
        )
        .map(
          (entry) =>
            entry.date
        )
    );
  const skippedDates = new Set(
    entries.filter((entry) => entry.habitId === habit.id && entry.skipped).map((entry) => entry.date)
  );
  // =========================
  // OBECNY TYDZIEŃ
  // =========================
  const currentWeekStart =
    getWeekStart(today);
  // =========================
  // PIERWSZY TYDZIEŃ
  // =========================
  const firstWeekStart =
    new Date(
      currentWeekStart
    );
  firstWeekStart.setDate(
    firstWeekStart.getDate() -
      (NUMBER_OF_WEEKS - 1) *
        7
  );
  // =========================
  // GENEROWANIE TYGODNI
  // =========================
  const weeks: ActivityDay[][] =
    [];
  for (
    let weekIndex = 0;
    weekIndex <
    NUMBER_OF_WEEKS;
    weekIndex++
  ) {
    const weekStart =
      new Date(
        firstWeekStart
      );
    weekStart.setDate(
      firstWeekStart.getDate() +
        weekIndex * 7
    );
    const week: ActivityDay[] =
      [];
    for (
      let dayIndex = 0;
      dayIndex < 7;
      dayIndex++
    ) {
      const date =
        new Date(weekStart);
      date.setDate(
        weekStart.getDate() +
          dayIndex
      );
      const dateKey =
        getDateKey(date);
      week.push({
        date,
        dateKey,
        completed:
          completedDates.has(
            dateKey
          ),
        skipped: skippedDates.has(dateKey),
        isToday:
          dateKey === todayKey,
      });
    }
    weeks.push(week);
  }
  // =========================
  // ETYKIETY MIESIĘCY
  // =========================
  const monthLabels =
    weeks.map(
      (week, index) => {
        const firstDay =
          week[0].date;
        if (index === 0) {
          return getMonthLabel(
            firstDay
          );
        }
        const previousWeek =
          weeks[index - 1];
        const previousMonth =
          previousWeek[0].date.getMonth();
        const currentMonth =
          firstDay.getMonth();
        if (
          previousMonth !==
          currentMonth
        ) {
          return getMonthLabel(
            firstDay
          );
        }
        return "";
      }
    );
  // =========================
  // LICZBA WYKONAŃ
  // =========================
  const firstDateKey =
    getDateKey(
      weeks[0][0].date
    );
  const completedInPeriod =
    entries.filter(
      (entry) =>
        entry.habitId ===
          habit.id &&
        entry.completed &&
        entry.date >=
          firstDateKey &&
        entry.date <= todayKey
    ).length;
  // =========================
  // RENDER
  // =========================
  return (
    <View style={styles.card}>
      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}
      <View
        style={styles.header}
      >
        <View>
          <Text
            style={styles.title}
          >
            Aktywność
          </Text>
          <Text
            style={
              styles.subtitle
            }
          >
            Ostatnie 6 miesięcy
          </Text>
        </View>
        <View
          style={[
            styles.totalBadge,
            {
              backgroundColor:
                habit.color.light,
            },
          ]}
        >
          <Text
            style={[
              styles.totalBadgeText,
              {
                color:
                  habit.color.dark,
              },
            ]}
          >
            {completedInPeriod}
          </Text>
        </View>
      </View>
      {/* ===================== */}
      {/* HEATMAP */}
      {/* ===================== */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        onContentSizeChange={
          scrollToLatest
        }
      >
        {/* =================== */}
        {/* DNI TYGODNIA */}
        {/* =================== */}
        <View
          style={
            styles.dayLabels
          }
        >
          <View
            style={
              styles.monthSpacer
            }
          />
          <Text
            style={
              styles.dayLabel
            }
          >
            Pn
          </Text>
          <Text
            style={
              styles.dayLabel
            }
          >
            Wt
          </Text>
          <Text
            style={
              styles.dayLabel
            }
          >
            Śr
          </Text>
          <Text
            style={
              styles.dayLabel
            }
          >
            Cz
          </Text>
          <Text
            style={
              styles.dayLabel
            }
          >
            Pt
          </Text>
          <Text
            style={
              styles.dayLabel
            }
          >
            So
          </Text>
          <Text
            style={
              styles.dayLabel
            }
          >
            Nd
          </Text>
        </View>
        {/* =================== */}
        {/* TYGODNIE */}
        {/* =================== */}
        <View>
          {/* ================= */}
          {/* MIESIĄCE */}
          {/* ================= */}
          <View
            style={
              styles.monthRow
            }
          >
            {monthLabels.map(
              (
                label,
                index
              ) => (
                <View
                  key={index}
                  style={
                    styles.monthCell
                  }
                >
                  <Text
                    style={
                      styles.monthText
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {label}
                  </Text>
                </View>
              )
            )}
          </View>
          {/* ================= */}
          {/* GRID */}
          {/* ================= */}
          <View
            style={
              styles.weeksRow
            }
          >
            {weeks.map(
              (
                week,
                weekIndex
              ) => (
                <View
                  key={
                    weekIndex
                  }
                  style={
                    styles.weekColumn
                  }
                >
                  {week.map(
                    (day) => {
                      const isFuture =
                        day.date >
                        today;
                      return (
                        <View
                          key={
                            day.dateKey
                          }
                          accessible
                          accessibilityLabel={`${day.dateKey}: ${isFuture ? "przyszły dzień" : day.skipped ? "pominięto" : day.completed ? "wykonano" : "brak wykonania"}`}
                          style={[
                            styles.cell,
                            isFuture
                              ? styles.futureCell
                              : day.skipped
                                ? { backgroundColor: colors.textMuted, borderColor: colors.textMuted }
                              : day.completed
                                ? {
                                    backgroundColor:
                                      habit
                                        .color
                                        .primary,
                                    borderColor:
                                      habit
                                        .color
                                        .primary,
                                  }
                                : styles.emptyCell,
                            day.isToday &&
                              styles.todayCell,
                          ]}
                        />
                      );
                    }
                  )}
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
      {/* ===================== */}
      {/* FOOTER */}
      {/* ===================== */}
      <View
        style={styles.footer}
      >
        {/* =================== */}
        {/* LEGENDA */}
        {/* =================== */}
        <View
          style={styles.legend}
        >
          <View
            style={[
              styles.legendCell,
              styles.emptyCell,
            ]}
          />
          <Text
            style={
              styles.legendText
            }
          >
            Brak
          </Text>
          <View
            style={[
              styles.legendCell,
              {
                backgroundColor:
                  habit.color
                    .primary,
                borderColor:
                  habit.color
                    .primary,
              },
            ]}
          />
          <Text
            style={
              styles.legendText
            }
          >
            Wykonano
          </Text>
          <View style={[styles.legendCell, { backgroundColor: colors.textMuted, borderColor: colors.textMuted }]} />
          <Text style={styles.legendText}>Pominięto</Text>
        </View>
        {/* =================== */}
        {/* LICZBA */}
        {/* =================== */}
        <Text
          style={
            styles.footerText
          }
        >
          {completedInPeriod} wyk.
        </Text>
      </View>
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
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        colors.border,
      paddingTop: 17,
      paddingBottom: 15,
      marginBottom: 22,
      overflow: "hidden",
    },
    // =====================
    // HEADER
    // =====================
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 17,
      marginBottom: 18,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 3,
    },
    totalBadge: {
      minWidth: 36,
      height: 30,
      borderRadius: 10,
      paddingHorizontal: 9,
      alignItems: "center",
      justifyContent:
        "center",
    },
    totalBadgeText: {
      fontSize: 12,
      fontWeight: "800",
    },
    // =====================
    // SCROLL
    // =====================
    scrollContent: {
      paddingHorizontal: 15,
      paddingBottom: 4,
    },
    // =====================
    // DNI TYGODNIA
    // =====================
    dayLabels: {
      width:
        DAY_LABEL_WIDTH,
      marginRight: 5,
    },
    monthSpacer: {
      height: 22,
    },
    dayLabel: {
      height:
        CELL_SIZE +
        CELL_GAP,
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "600",
      lineHeight:
        CELL_SIZE,
      textAlign: "left",
    },
    // =====================
    // MIESIĄCE
    // =====================
    monthRow: {
      height: 22,
      flexDirection: "row",
    },
    monthCell: {
      width:
        CELL_SIZE +
        CELL_GAP,
    },
    monthText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: "600",
      overflow: "visible",
    },
    // =====================
    // GRID
    // =====================
    weeksRow: {
      flexDirection: "row",
    },
    weekColumn: {
      width:
        CELL_SIZE +
        CELL_GAP,
      gap: CELL_GAP,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 3,
      borderWidth: 1,
    },
    emptyCell: {
      backgroundColor:
        colors.surfaceSecondary,
      borderColor:
        colors.border,
    },
    futureCell: {
      backgroundColor:
        "transparent",
      borderColor:
        "transparent",
    },
    todayCell: {
      borderWidth: 2,
      borderColor:
        colors.text,
    },
    // =====================
    // FOOTER
    // =====================
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 17,
      marginTop: 14,
    },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendCell: {
      width: 10,
      height: 10,
      borderRadius: 3,
      borderWidth: 1,
    },
    legendText: {
      color: colors.textMuted,
      fontSize: 9,
      marginRight: 5,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
    },
    });
}
