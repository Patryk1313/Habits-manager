import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Archive,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  HeartPulse,
  ListChecks,
  Plus,
  Sun,
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HabitIcon from "../../components/HabitIcon";
import { getFrequencyLabel } from "../../components/FrequencyPicker";
import { useHabits } from "../../context/HabitsContext";
import { useHabitEntries } from "../../context/HabitEntriesContext";
import { useTheme } from "../../context/ThemeContext";
import type { AppThemeColors } from "../../context/ThemeContext";
import { useRoutines } from "../../context/RoutinesContext";
import { useRoutineEntries } from "../../context/RoutineEntriesContext";
import { isHabitScheduledForDate } from "../../utils/habit-schedule";
import { getHabitWeeklyCount } from "../../utils/habit-week";
import type {
  Routine,
  RoutineTimeOfDay,
} from "../../types/routine";
// =========================
// TYP DNIA
// =========================
type Day = {
  date: Date;
  key: string;
  weekday: string;
  dayNumber: string;
  isToday: boolean;
};
// =========================
// KATEGORIE
// =========================
const categories = [
  "Codzienne",
  "Zdrowie",
  "Rozwój",
] as const;
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
// NAZWA WYBRANEGO DNIA
// =========================
function getRelativeDateLabel(
  date: Date,
  today: Date
) {
  const dateKey = getDateKey(date);
  const todayKey = getDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(
    yesterday.getDate() - 1
  );
  if (dateKey === todayKey) {
    return "Dzisiaj";
  }
  if (
    dateKey === getDateKey(yesterday)
  ) {
    return "Wczoraj";
  }
  return date.toLocaleDateString(
    "pl-PL",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );
}
// =========================
// DZIŚ I 7 POPRZEDNICH DNI
// =========================
function createDays(): Day[] {
  const today = new Date();
  const days: Day[] = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(
      today.getDate() - i
    );
    days.push({
      date,
      key: getDateKey(date),
      weekday: date
        .toLocaleDateString(
          "pl-PL",
          {
            weekday: "short",
          }
        )
        .replace(".", ""),
      dayNumber: String(
        date.getDate()
      ),
      isToday: i === 0,
    });
  }
  return days;
}

function isWithinEditableDateRange(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);
  const selectedUtc = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const daysAgo = (todayUtc - selectedUtc) / 86400000;

  return Number.isInteger(daysAgo) && daysAgo >= 0 && daysAgo <= 1;
}
// =========================
// CZY RUTYNA JEST NA DZIEŃ
// =========================
function isRoutineScheduledForDate(
  routine: Routine,
  date: Date
) {
  if (
    routine.frequency.type ===
    "daily"
  ) {
    return true;
  }
  if (
    routine.frequency.type ===
    "selectedDays"
  ) {
    return routine.frequency.selectedDays.includes(
      date.getDay()
    );
  }
  return false;
}
// =========================
// PORA DNIA
// =========================
function getRoutineTimeLabel(
  timeOfDay: RoutineTimeOfDay
) {
  switch (timeOfDay) {
    case "morning":
      return "Rano";
    case "afternoon":
      return "Popołudnie";
    case "evening":
      return "Wieczór";
    case "night":
      return "Noc";
    case "anytime":
      return "Dowolnie";
    default:
      return "";
  }
}
// =========================
// EKRAN
// =========================
export default function Index() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);
  // =========================
  // NAWYKI
  // =========================
  const {
    habits,
    isLoading: habitsLoading,
  } = useHabits();
  // =========================
  // HISTORIA NAWYKÓW
  // =========================
  const {
    entries,
    isHabitCompleted,
    toggleHabit: toggleHabitEntry,
    isLoading: entriesLoading,
  } = useHabitEntries();
  // =========================
  // RUTYNY
  // =========================
  const {
    routines,
    isLoading: routinesLoading,
  } = useRoutines();
  // =========================
  // HISTORIA RUTYN
  // =========================
  const {
    isStepCompleted,
    toggleStep,
    getRoutineCompletedCount,
    isLoading: routineEntriesLoading,
  } = useRoutineEntries();
  // =========================
  // WYBRANA DATA
  // =========================
  const [
    selectedDateKey,
    setSelectedDateKey,
  ] = useState(() =>
    getDateKey(new Date())
  );
  const daysScrollViewRef =
    useRef<ScrollView>(null);
  // =========================
  // ZWINIĘTE GRUPY
  // =========================
  const [
    collapsed,
    setCollapsed,
  ] = useState<string[]>([]);
  // =========================
  // RUTYNY ZWINIĘTE
  // =========================
  const [
    routinesCollapsed,
    setRoutinesCollapsed,
  ] = useState(false);
  const [
    collapsedRoutineIds,
    setCollapsedRoutineIds,
  ] = useState<string[]>([]);
  // =========================
  // DATY
  // =========================
  const days = createDays();
  const today = new Date();
  const selectedDate =
    days.find(
      (day) =>
        day.key === selectedDateKey
    )?.date ?? today;
  const selectedDateLabel =
    getRelativeDateLabel(
      selectedDate,
      today
    );
  const isHistoricalDate =
    selectedDateKey < getDateKey(today);
  const canEditSelectedDate =
    isWithinEditableDateRange(selectedDateKey);
  // =========================
  // AKTYWNE / ARCHIWALNE
  // =========================
  const activeHabits =
    habits.filter(
      (habit) => !habit.archived
    );
  const archivedHabitsCount =
    habits.filter(
      (habit) => habit.archived
    ).length;
  // =========================
  // GRUPY NAWYKÓW
  // =========================
  const groups = categories.map(
    (category) => ({
      category,
      habits: activeHabits.filter(
        (habit) => {
          if (habit.category !== category) {
            return false;
          }

          return (
            isHistoricalDate ||
            isHabitScheduledForDate(
              habit.frequency,
              selectedDate,
              habit.createdAt
            )
          );
        }
      ),
    })
  );
  // =========================
  // AKTYWNE RUTYNY
  // =========================
  const activeRoutines =
    routines.filter(
      (routine) =>
        !routine.archived
    );
  // =========================
  // RUTYNY NA WYBRANY DZIEŃ
  // =========================
  const selectedDateRoutines =
    activeRoutines.filter(
      (routine) => {
        return (
          isHistoricalDate ||
          isRoutineScheduledForDate(
            routine,
            selectedDate
          )
        );
      }
    );
  // =========================
  // UKOŃCZONE RUTYNY
  // =========================
  const completedRoutinesCount =
    selectedDateRoutines.filter(
      (routine) => {
        if (
          routine.steps.length === 0
        ) {
          return false;
        }
        const completed =
          getRoutineCompletedCount(
            routine.id,
            selectedDateKey
          );
        return (
          completed ===
          routine.steps.length
        );
      }
    ).length;
  // =========================
  // ZAZNACZANIE NAWYKU
  // =========================
  const toggleHabit = (
    habitId: string,
    value: number | null = null
  ) => {
    if (!isWithinEditableDateRange(selectedDateKey)) {
      return;
    }

    toggleHabitEntry(
      habitId,
      selectedDateKey,
      value
    );
  };
  const toggleRoutineStep = (
    routineId: string,
    stepId: string
  ) => {
    if (!isWithinEditableDateRange(selectedDateKey)) {
      return;
    }

    toggleStep(routineId, stepId, selectedDateKey);
  };
  // =========================
  // SZCZEGÓŁY NAWYKU
  // =========================
  const openHabit = (
    habitId: string
  ) => {
    router.push({
      pathname: "/habit/[id]",
      params: {
        id: habitId,
      },
    });
  };
  // =========================
  // ZWIJANIE GRUP
  // =========================
  const toggleGroup = (
    category: string
  ) => {
    setCollapsed((current) =>
      current.includes(category)
        ? current.filter(
            (item) =>
              item !== category
          )
        : [...current, category]
    );
  };
  const toggleRoutineSteps = (
    routineId: string
  ) => {
    setCollapsedRoutineIds((current) =>
      current.includes(routineId)
        ? current.filter((id) => id !== routineId)
        : [...current, routineId]
    );
  };
  // =========================
  // DODAWANIE
  // =========================
  const openAddHabit = () => {
    router.push("/add-habit");
  };
  // =========================
  // ARCHIWUM
  // =========================
  const openArchive = () => {
    router.push("/archive");
  };
  // =========================
  // LOADING
  // =========================
  const isLoading =
    habitsLoading ||
    entriesLoading ||
    routinesLoading ||
    routineEntriesLoading;
  // =========================
  // LICZBA NAWYKÓW
  // =========================
  const scheduledHabitsCount =
    groups.reduce(
      (total, group) =>
        total +
        group.habits.length,
      0
    );
  // =========================
  // RENDER
  // =========================
  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        edges={["top"]}
        style={styles.safeArea}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={
            styles.contentContainer
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ========================= */}
          {/* OŚ CZASU */}
          {/* ========================= */}
          <View
            style={
              styles.timelineHeader
            }
          >
            <View style={styles.timelineHeaderContent}>
              <Text style={styles.timelineTitle}>
                Twoja aktywność
              </Text>
              <Text style={styles.timelineSubtitle}>
                {selectedDateLabel
                  .charAt(0)
                  .toUpperCase() +
                  selectedDateLabel.slice(1)}
              </Text>
            </View>
            {!isLoading && (
              <Pressable
                onPress={openAddHabit}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && { opacity: 0.65 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Dodaj nawyk"
              >
                <Plus
                  size={24}
                  color={colors.accentForeground}
                  strokeWidth={2.2}
                />
              </Pressable>
            )}
          </View>
          <View
            style={
              styles.timelineContainer
            }
          >
            <ScrollView
              ref={daysScrollViewRef}
              horizontal
              onContentSizeChange={() =>
                daysScrollViewRef.current?.scrollToEnd({
                  animated: false,
                })
              }
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.timeline
              }
            >
              {days.map((day) => {
                const isSelected =
                  day.key ===
                  selectedDateKey;
                return (
                  <Pressable
                    key={day.key}
                    onPress={() =>
                      setSelectedDateKey(
                        day.key
                      )
                    }
                    style={[
                      styles.dayItem,
                      isSelected &&
                        styles.selectedDayItem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayWeekday,
                        isSelected &&
                          styles.selectedDayText,
                      ]}
                    >
                      {day.isToday
                        ? "Dziś"
                        : day.weekday}
                    </Text>
                    <Text
                      style={[
                        styles.dayNumber,
                        isSelected &&
                          styles.selectedDayText,
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                    {day.isToday && (
                      <View
                        style={[
                          styles.todayDot,
                          isSelected &&
                            styles.selectedTodayDot,
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          {!canEditSelectedDate && (
            <Text style={styles.readOnlyNotice}>
              Możesz uzupełniać wykonania dzisiaj i wczoraj.
            </Text>
          )}
          {/* ========================= */}
          {/* LOADING */}
          {/* ========================= */}
          {isLoading && (
            <View
              style={
                styles.loadingCard
              }
            >
              <Text
                style={
                  styles.loadingText
                }
              >
                Wczytywanie...
              </Text>
            </View>
          )}
          {/* ========================= */}
          {/* BRAK NAWYKÓW */}
          {/* ========================= */}
          {!isLoading &&
            activeHabits.length ===
              0 && (
              <View
                style={
                  styles.emptyState
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <CheckCircle2 size={25} color={colors.accent} strokeWidth={2.2} />
                </View>
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  Brak nawyków
                </Text>
                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Dodaj swój pierwszy
                  nawyk i zacznij budować
                  regularność.
                </Text>
              </View>
            )}
          {/* ========================= */}
          {/* BRAK NAWYKÓW NA DZIEŃ */}
          {/* ========================= */}
          {!isLoading &&
            activeHabits.length > 0 &&
            scheduledHabitsCount ===
              0 && (
              <View
                style={
                  styles.emptyState
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Sun size={25} color={colors.accent} strokeWidth={2.2} />
                </View>
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  Brak nawyków na ten
                  dzień
                </Text>
                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Na ten dzień nie masz
                  zaplanowanych żadnych
                  nawyków.
                </Text>
              </View>
            )}
          {/* ========================= */}
          {/* GRUPY NAWYKÓW */}
          {/* ========================= */}
          {!isLoading &&
            groups.map(
              ({
                category,
                habits:
                  categoryHabits,
              }) => {
                if (
                  categoryHabits.length ===
                  0
                ) {
                  return null;
                }
                const done =
                  categoryHabits.filter(
                    (habit) => {
                      if (
                        isHabitCompleted(
                          habit.id,
                          selectedDateKey
                        )
                      ) {
                        return true;
                      }

                      return (
                        habit.frequency.type === "timesPerWeek" &&
                        getHabitWeeklyCount(
                          entries,
                          habit.id,
                          selectedDate
                        ) >= habit.frequency.timesPerWeek
                      );
                    }
                  ).length;
                const isCollapsed =
                  collapsed.includes(
                    category
                  );
                return (
                  <View
                    key={category}
                    style={
                      styles.group
                    }
                  >
                    {/* HEADER */}
                    <Pressable
                      onPress={() =>
                        toggleGroup(
                          category
                        )
                      }
                      style={
                        styles.groupHeader
                      }
                    >
                      {category === "Codzienne" ? (
                        <Sun size={19} color={colors.textSecondary} strokeWidth={2} />
                      ) : category === "Zdrowie" ? (
                        <HeartPulse size={19} color={colors.textSecondary} strokeWidth={2} />
                      ) : (
                        <Brain size={19} color={colors.textSecondary} strokeWidth={2} />
                      )}
                      <Text
                        style={
                          styles.groupTitle
                        }
                      >
                        {category}
                      </Text>
                      <View
                        style={
                          styles.groupCount
                        }
                      >
                        <Text
                          style={
                            styles.groupCountText
                          }
                        >
                          {done}/
                          {
                            categoryHabits.length
                          }
                        </Text>
                      </View>
                      <View
                        style={
                          styles.headerSpacer
                        }
                      />
                      {isCollapsed ? (
                        <ChevronDown size={21} color={colors.textMuted} strokeWidth={2} />
                      ) : (
                        <ChevronUp size={21} color={colors.textMuted} strokeWidth={2} />
                      )}
                    </Pressable>
                    {/* NAWYKI */}
                    {!isCollapsed &&
                      categoryHabits.map(
                        (habit) => {
                          const entryCompleted =
                            isHabitCompleted(
                              habit.id,
                              selectedDateKey
                            );
                          const frequencyLabel =
                            getFrequencyLabel(
                              habit.frequency
                            );
                          const quantityLabel =
                            habit.type ===
                              "quantity" &&
                            habit.targetValue !==
                              null &&
                            habit.unit
                              ? `${habit.targetValue} ${habit.unit.symbol}`
                              : null;
                          const isWeeklyHabit =
                            habit.frequency
                              .type ===
                            "timesPerWeek";
                          const weeklyTarget =
                            isWeeklyHabit
                              ? habit
                                  .frequency
                                  .timesPerWeek
                              : 0;
                          const weeklyCount =
                            isWeeklyHabit
                              ? getHabitWeeklyCount(
                                  entries,
                                  habit.id,
                                  selectedDate
                                )
                              : 0;
                          const weeklyGoalReached =
                            isWeeklyHabit &&
                            weeklyCount >=
                              weeklyTarget;
                          const completed =
                            entryCompleted ||
                            weeklyGoalReached;
                          const canToggleHabit =
                            canEditSelectedDate &&
                            (!weeklyGoalReached || entryCompleted);
                          return (
                            <Pressable
                              key={
                                habit.id
                              }
                              onPress={() =>
                                openHabit(
                                  habit.id
                                )
                              }
                              style={({
                                pressed,
                              }) => [
                                styles.habitCard,
                                weeklyGoalReached && styles.habitCardWeeklyCompleted,
                                pressed &&
                                  styles.habitCardPressed,
                              ]}
                            >
                              {/* IKONA */}
                              <View
                                style={[
                                  styles.habitIcon,
                                  {
                                    backgroundColor:
                                      habit
                                        .color
                                        .light,
                                  },
                                ]}
                              >
                                <HabitIcon
                                  name={habit.icon}
                                  size={25}
                                  color={habit.color.primary}
                                />
                              </View>
                              {/* INFO */}
                              <View
                                style={
                                  styles.habitInfo
                                }
                              >
                                <Text
                                  style={[
                                    styles.habitName,
                                    weeklyGoalReached &&
                                      styles.habitNameWeeklyCompleted,
                                  ]}
                                >
                                  {
                                    habit.name
                                  }
                                </Text>
                                <Text
                                  style={
                                    styles.habitSubtitle
                                  }
                                >
                                  {completed
                                    ? "Wykonano"
                                    : "Do wykonania"}
                                  {" · "}
                                  {quantityLabel
                                    ? `${quantityLabel} · `
                                    : ""}
                                  {
                                    frequencyLabel
                                  }
                                </Text>
                                {/* WEEKLY */}
                                {isWeeklyHabit && (
                                  <View
                                    style={
                                      styles.weeklyProgress
                                    }
                                  >
                                    <View
                                      style={
                                        styles.weeklyDots
                                      }
                                    >
                                      {Array.from(
                                        {
                                          length:
                                            weeklyTarget,
                                        }
                                      ).map(
                                        (
                                          _,
                                          index
                                        ) => {
                                          const filled =
                                            index <
                                            weeklyCount;
                                          return (
                                            <View
                                              key={
                                                index
                                              }
                                              style={[
                                                styles.weeklyDot,
                                                filled
                                                  ? weeklyGoalReached
                                                    ? styles.weeklyDotCompleted
                                                    : {
                                                      backgroundColor:
                                                        habit
                                                          .color
                                                          .primary,
                                                    }
                                                  : styles.weeklyDotEmpty,
                                              ]}
                                            />
                                          );
                                        }
                                      )}
                                    </View>
                                    <Text
                                      style={[
                                        styles.weeklyText,
                                        weeklyGoalReached &&
                                          styles.weeklyTextCompleted,
                                      ]}
                                    >
                                      {weeklyGoalReached
                                        ? "Cel tygodniowy osiągnięty"
                                        : `${weeklyCount} z ${weeklyTarget}`}
                                    </Text>
                                  </View>
                                )}
                                {/* REMINDER */}
                                {habit.reminder
                                  .enabled && (
                                  <View
                                    style={
                                      styles.habitMetaRow
                                    }
                                  >
                                    <View
                                      style={[
                                        styles.metaDot,
                                        {
                                          backgroundColor:
                                            habit
                                              .color
                                              .primary,
                                        },
                                      ]}
                                    />
                                    <Text
                                      style={
                                        styles.habitMeta
                                      }
                                    >
                                      Przypomnienie{" "}
                                      {String(
                                        habit
                                          .reminder
                                          .hour
                                      ).padStart(
                                        2,
                                        "0"
                                      )}
                                      :
                                      {String(
                                        habit
                                          .reminder
                                          .minute
                                      ).padStart(
                                        2,
                                        "0"
                                      )}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              {/* CHECK */}
                              <Pressable
                                disabled={!canToggleHabit}
                                accessibilityState={{
                                  disabled: !canToggleHabit,
                                  checked: completed,
                                }}
                                hitSlop={10}
                                onPress={(
                                  event
                                ) => {
                                  event.stopPropagation();
                                  toggleHabit(
                                    habit.id,
                                    habit.type ===
                                      "quantity"
                                      ? habit.targetValue
                                      : null
                                  );
                                }}
                                style={({
                                  pressed,
                                }) => [
                                  styles.checkButton,
                                  !canToggleHabit &&
                                    styles.checkButtonDisabled,
                                  pressed && canToggleHabit &&
                                    styles.checkButtonPressed,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.checkCircle,
                                    completed && {
                                      backgroundColor:
                                        weeklyGoalReached
                                          ? colors.textMuted
                                          : habit.color.primary,
                                      borderColor:
                                        weeklyGoalReached
                                          ? colors.textMuted
                                          : habit.color.primary,
                                    },
                                  ]}
                                >
                                  {completed && (
                                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                                  )}
                                </View>
                              </Pressable>
                            </Pressable>
                          );
                        }
                      )}
                  </View>
                );
              }
            )}
          {/* ========================= */}
          {/* RUTYNY */}
          {/* ========================= */}
          {!isLoading &&
            selectedDateRoutines.length >
              0 && (
              <View
                style={
                  styles.routinesSection
                }
              >
                {/* HEADER RUTYN */}
                <Pressable
                  onPress={() =>
                    setRoutinesCollapsed(
                      (current) =>
                        !current
                    )
                  }
                  style={
                    styles.groupHeader
                  }
                >
                  <ListChecks size={19} color={colors.textSecondary} strokeWidth={2} />
                  <Text
                    style={
                      styles.groupTitle
                    }
                  >
                    Rutyny
                  </Text>
                  <View
                    style={
                      styles.groupCount
                    }
                  >
                    <Text
                      style={
                        styles.groupCountText
                      }
                    >
                      {
                        completedRoutinesCount
                      }
                      /
                      {
                        selectedDateRoutines.length
                      }
                    </Text>
                  </View>
                  <View
                    style={
                      styles.headerSpacer
                    }
                  />
                  {routinesCollapsed ? (
                    <ChevronDown size={21} color={colors.textMuted} strokeWidth={2} />
                  ) : (
                    <ChevronUp size={21} color={colors.textMuted} strokeWidth={2} />
                  )}
                </Pressable>
                {/* LISTA RUTYN */}
                {!routinesCollapsed &&
                  selectedDateRoutines.map(
                    (routine) => {
                      const sortedSteps =
                        [
                          ...routine.steps,
                        ].sort(
                          (a, b) =>
                            a.order -
                            b.order
                        );
                      const completedCount =
                        getRoutineCompletedCount(
                          routine.id,
                          selectedDateKey
                        );
                      const totalSteps =
                        sortedSteps.length;
                      const progress =
                        totalSteps > 0
                          ? Math.round(
                              (completedCount /
                                totalSteps) *
                                100
                            )
                          : 0;
                      const completed =
                        totalSteps > 0 &&
                        completedCount ===
                          totalSteps;
                      const isRoutineCollapsed =
                        collapsedRoutineIds.includes(
                          routine.id
                        );
                      return (
                        <View
                          key={
                            routine.id
                          }
                          style={
                            styles.routineCard
                          }
                        >
                          {/* ROUTINE HEADER */}
                          <Pressable
                            onPress={() =>
                              toggleRoutineSteps(
                                routine.id
                              )
                            }
                            accessibilityRole="button"
                            accessibilityState={{
                              expanded:
                                !isRoutineCollapsed,
                            }}
                            style={
                              styles.routineHeader
                            }
                          >
                            <View
                              style={[
                                styles.routineIcon,
                                {
                                  backgroundColor:
                                    `${routine.color}18`,
                                },
                              ]}
                            >
                              <HabitIcon
                                name={routine.icon || "CircleCheck"}
                                size={25}
                                color={routine.color}
                              />
                            </View>
                            <View
                              style={
                                styles.routineInfo
                              }
                            >
                              <Text
                                style={
                                  styles.routineName
                                }
                              >
                                {
                                  routine.name
                                }
                              </Text>
                              <Text
                                style={
                                  styles.routineSubtitle
                                }
                              >
                                {getRoutineTimeLabel(
                                  routine.timeOfDay
                                )}
                                {" · "}
                                {totalSteps}{" "}
                                {totalSteps ===
                                1
                                  ? "czynność"
                                  : "czynności"}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.routineCount,
                                completed && {
                                  backgroundColor:
                                    routine.color,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.routineCountText,
                                  {
                                    color:
                                      completed
                                        ? "#FFFFFF"
                                        : routine.color,
                                  },
                                ]}
                              >
                                {
                                  completedCount
                                }
                                /{totalSteps}
                              </Text>
                            </View>
                            {isRoutineCollapsed ? (
                              <ChevronDown size={20} color={colors.textMuted} />
                            ) : (
                              <ChevronUp size={20} color={colors.textMuted} />
                            )}
                          </Pressable>
                          {!isRoutineCollapsed && (
                            <>
                          {/* PROGRESS */}
                          <View
                            style={
                              styles.routineProgress
                            }
                          >
                            <View
                              style={
                                styles.routineProgressHeader
                              }
                            >
                              <Text
                                style={
                                  styles.routineProgressLabel
                                }
                              >
                                {completed
                                  ? "Rutyna ukończona"
                                  : "Postęp"}
                              </Text>
                              <Text
                                style={[
                                  styles.routineProgressPercent,
                                  {
                                    color:
                                      routine.color,
                                  },
                                ]}
                              >
                                {progress}%
                              </Text>
                            </View>
                            <View
                              style={
                                styles.routineProgressTrack
                              }
                            >
                              <View
                                style={[
                                  styles.routineProgressFill,
                                  {
                                    width: `${progress}%`,
                                    backgroundColor:
                                      routine.color,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          {/* CHECKLIST */}
                          <View
                            style={
                              styles.routineSteps
                            }
                          >
                            {sortedSteps.map(
                              (
                                step,
                                index
                              ) => {
                                const stepCompleted =
                                  isStepCompleted(
                                    routine.id,
                                    step.id,
                                    selectedDateKey
                                  );
                                return (
                                  <View
                                    key={
                                      step.id
                                    }
                                  >
                                    <Pressable
                                      disabled={!canEditSelectedDate}
                                      onPress={() =>
                                        toggleRoutineStep(
                                          routine.id,
                                          step.id
                                        )
                                      }
                                      style={({
                                        pressed,
                                      }) => [
                                        styles.routineStep,
                                        !canEditSelectedDate &&
                                          styles.routineStepDisabled,
                                        pressed && {
                                          opacity:
                                            0.6,
                                        },
                                      ]}
                                    >
                                      <View
                                        style={[
                                          styles.routineCheckbox,
                                          stepCompleted && {
                                            backgroundColor:
                                              routine.color,
                                            borderColor:
                                              routine.color,
                                          },
                                        ]}
                                      >
                                        {stepCompleted && (
                                          <Check size={15} color="#FFFFFF" strokeWidth={3} />
                                        )}
                                      </View>
                                      <Text
                                        style={[
                                          styles.routineStepName,
                                          stepCompleted &&
                                            styles.routineStepNameCompleted,
                                        ]}
                                      >
                                        {
                                          step.name
                                        }
                                      </Text>
                                    </Pressable>
                                    {index <
                                      sortedSteps.length -
                                        1 && (
                                      <View
                                        style={
                                          styles.routineDivider
                                        }
                                      />
                                    )}
                                  </View>
                                );
                              }
                            )}
                          </View>
                          {/* COMPLETED */}
                          {completed && (
                            <View
                              style={[
                                styles.routineCompleted,
                                {
                                  backgroundColor:
                                    `${routine.color}12`,
                                },
                              ]}
                            >
                              <Check size={17} color={routine.color} strokeWidth={2.5} />
                              <Text
                                style={[
                                  styles.routineCompletedText,
                                  {
                                    color:
                                      routine.color,
                                  },
                                ]}
                              >
                                Wszystkie
                                czynności
                                wykonane
                              </Text>
                            </View>
                          )}
                            </>
                          )}
                        </View>
                      );
                    }
                  )}
              </View>
            )}
          {/* ========================= */}
          {/* ARCHIWUM */}
          {/* ========================= */}
          {!isLoading && (
            <Pressable
              onPress={openArchive}
              style={({ pressed }) => [
                styles.archiveCard,
                pressed &&
                  styles.archiveCardPressed,
              ]}
            >
              <View
                style={
                  styles.archiveIcon
                }
              >
                <Archive size={22} color={colors.textSecondary} strokeWidth={2} />
              </View>
              <View
                style={
                  styles.archiveContent
                }
              >
                <Text
                  style={
                    styles.archiveTitle
                  }
                >
                  Archiwum
                </Text>
                <Text
                  style={
                    styles.archiveSubtitle
                  }
                >
                  Zarchiwizowane nawyki
                </Text>
              </View>
              {archivedHabitsCount >
                0 && (
                <View
                  style={
                    styles.archiveCount
                  }
                >
                  <Text
                    style={
                      styles.archiveCountText
                    }
                  >
                    {
                      archivedHabitsCount
                    }
                  </Text>
                </View>
              )}
              <ChevronRight size={22} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          )}
          <View
            style={
              styles.bottomSpace
            }
          />
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
  },
  // =========================
  // TIMELINE
  // =========================
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  timelineHeaderContent: {
    flex: 1,
    paddingRight: 14,
  },
  timelineTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  timelineSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textTransform: "capitalize",
  },
  timelineContainer: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22,
    paddingVertical: 12,
  },
  readOnlyNotice: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: -14,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timeline: {
    paddingHorizontal: 10,
    gap: 9,
  },
  dayItem: {
    width: 58,
    minHeight: 76,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    backgroundColor: colors.background,
  },
  selectedDayItem: {
    backgroundColor: colors.accent,
  },
  dayWeekday: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dayNumber: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 4,
  },
  selectedDayText: {
    color: colors.accentForeground,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  selectedTodayDot: {
    backgroundColor: colors.surface,
  },
  // =========================
  // LOADING
  // =========================
  loadingCard: {
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  // =========================
  // EMPTY
  // =========================
  emptyState: {
    minHeight: 210,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 28,
    marginBottom: 20,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyIconText: {
    color: colors.accent,
    fontSize: 23,
    fontWeight: "800",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 250,
  },
  // =========================
  // GROUP
  // =========================
  group: {
    marginBottom: 18,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
    gap: 10,
    marginBottom: 5,
  },
  groupSymbol: {
    width: 20,
    color: colors.textSecondary,
    fontSize: 19,
    textAlign: "center",
  },
  groupTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  groupCount: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  groupCountText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  headerSpacer: {
    flex: 1,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 23,
    paddingHorizontal: 5,
  },
  // =========================
  // HABIT
  // =========================
  habitCard: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    backgroundColor: colors.surface,
  },
  habitCardWeeklyCompleted: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.textMuted,
    opacity: 0.78,
  },
  habitCardPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },
  habitIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  habitInfo: {
    flex: 1,
    justifyContent: "center",
  },
  habitName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  habitNameWeeklyCompleted: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  habitSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  habitMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  metaDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
  },
  habitMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  // =========================
  // WEEKLY
  // =========================
  weeklyProgress: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  weeklyDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  weeklyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weeklyDotCompleted: {
    backgroundColor: colors.textMuted,
  },
  weeklyDotEmpty: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weeklyText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  weeklyTextCompleted: {
    color: colors.textMuted,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  // =========================
  // HABIT CHECK
  // =========================
  checkButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  checkButtonPressed: {
    opacity: 0.55,
  },
  checkButtonDisabled: {
    opacity: 0.4,
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 21,
  },
  // =========================
  // ROUTINES
  // =========================
  routinesSection: {
    marginBottom: 20,
  },
  routineCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    padding: 15,
    marginTop: 9,
  },
  routineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routineIconText: {
    fontSize: 21,
    fontWeight: "700",
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  routineSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  routineCount: {
    minWidth: 46,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  routineCountText: {
    fontSize: 11,
    fontWeight: "800",
  },
  // =========================
  // ROUTINE PROGRESS
  // =========================
  routineProgress: {
    marginTop: 16,
    marginBottom: 12,
  },
  routineProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  routineProgressLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  routineProgressPercent: {
    fontSize: 11,
    fontWeight: "800",
  },
  routineProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceSecondary,
    overflow: "hidden",
  },
  routineProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  // =========================
  // ROUTINE STEPS
  // =========================
  routineSteps: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    overflow: "hidden",
  },
  routineStep: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  routineStepDisabled: {
    opacity: 0.45,
  },
  routineCheckbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  routineCheckmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  routineStepName: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  routineStepNameCompleted: {
    color: colors.textMuted,
    textDecorationLine:
      "line-through",
  },
  routineDivider: {
    height: 1,
    backgroundColor: colors.surfaceSecondary,
    marginLeft: 48,
  },
  routineCompleted: {
    minHeight: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  routineCompletedText: {
    fontSize: 11,
    fontWeight: "700",
  },
  // =========================
  // ARCHIVE
  // =========================
  archiveCard: {
    minHeight: 72,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  archiveCardPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },
  archiveIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  archiveIconText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "700",
  },
  archiveContent: {
    flex: 1,
  },
  archiveTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  archiveSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  archiveCount: {
    minWidth: 28,
    height: 25,
    borderRadius: 9,
    paddingHorizontal: 8,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  archiveCountText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  archiveArrow: {
    color: colors.textMuted,
    fontSize: 26,
  },
  // =========================
  // ADD
  // =========================
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpace: {
    height: 20,
  },
});
}
