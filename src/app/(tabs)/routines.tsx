import { useRouter } from "expo-router";
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
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheckBig,
  Info,
  Plus,
  Repeat2,
} from "lucide-react-native";
import { useRoutines } from "../../context/RoutinesContext";
import { useRoutineEntries } from "../../context/RoutineEntriesContext";
import {
  AppThemeColors,
  useTheme,
} from "../../context/ThemeContext";
import {
  Routine,
  RoutineTimeOfDay,
} from "../../types/routine";
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
// CZY RUTYNA JEST NA DZISIAJ
// =========================
function isRoutineScheduledForDate(
  routine: Routine,
  date: Date
) {
  if (routine.frequency.type === "daily") {
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
// LABEL PORY DNIA
// =========================
function getTimeOfDayLabel(
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
// SCREEN
// =========================
export default function RoutinesScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);
  // =========================
  // CONTEXT RUTYN
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
    isLoading: entriesLoading,
  } = useRoutineEntries();
  // =========================
  // DZISIAJ
  // =========================
  const today = new Date();
  const todayKey =
    getDateKey(today);
  // =========================
  // AKTYWNE RUTYNY
  // =========================
  const activeRoutines =
    routines.filter(
      (routine) =>
        !routine.archived
    );
  // =========================
  // RUTYNY NA DZISIAJ
  // =========================
  const todayRoutines =
    activeRoutines.filter(
      (routine) =>
        isRoutineScheduledForDate(
          routine,
          today
        )
    );
  // =========================
  // UKOŃCZONE RUTYNY
  // =========================
  const completedToday =
    todayRoutines.filter(
      (routine) => {
        if (
          routine.steps.length === 0
        ) {
          return false;
        }
        const completed =
          getRoutineCompletedCount(
            routine.id,
            todayKey
          );
        return (
          completed ===
          routine.steps.length
        );
      }
    ).length;
  // =========================
  // LOADING
  // =========================
  if (
    routinesLoading ||
    entriesLoading
  ) {
    return (
      <View style={styles.screen}>
        <SafeAreaView
          style={styles.safeArea}
        >
          <View
            style={
              styles.loadingContainer
            }
          >
            <Text
              style={styles.loadingText}
            >
              Wczytywanie rutyn...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }
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
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* ========================= */}
          {/* HEADER */}
          {/* ========================= */}
          <View style={styles.header}>
            <View
              style={
                styles.headerContent
              }
            >
              <Text
                style={styles.eyebrow}
              >
                TWOJE RUTYNY
              </Text>
              <Text style={styles.title}>
                Rutyny
              </Text>
              <Text
                style={styles.subtitle}
              >
                Wykonuj swoje codzienne
                czynności krok po kroku.
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push(
                  "/add-routine"
                )
              }
              style={({ pressed }) => [
                styles.addButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Plus size={24} color={colors.surface} strokeWidth={2.2} />
            </Pressable>
          </View>
          {/* ========================= */}
          {/* PODSUMOWANIE */}
          {/* ========================= */}
          <View
            style={styles.summaryRow}
          >
            <View
              style={styles.summaryCard}
            >
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {activeRoutines.length}
              </Text>
              <Text
                style={
                  styles.summaryLabel
                }
              >
                aktywne
              </Text>
            </View>
            <View
              style={styles.summaryCard}
            >
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {todayRoutines.length}
              </Text>
              <Text
                style={
                  styles.summaryLabel
                }
              >
                dzisiaj
              </Text>
            </View>
            <View
              style={styles.summaryCard}
            >
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {completedToday}
              </Text>
              <Text
                style={
                  styles.summaryLabel
                }
              >
                wykonane
              </Text>
            </View>
          </View>
          {/* ========================= */}
          {/* DZISIAJ */}
          {/* ========================= */}
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              DZISIAJ
            </Text>
            {todayRoutines.length >
              0 && (
              <Text
                style={
                  styles.sectionCounter
                }
              >
                {completedToday}/
                {todayRoutines.length}
              </Text>
            )}
          </View>
          {/* ========================= */}
          {/* BRAK WSZYSTKICH RUTYN */}
          {/* ========================= */}
          {activeRoutines.length ===
          0 ? (
            <View
              style={styles.emptyCard}
            >
              <View
                style={styles.emptyIcon}
              >
                <Repeat2 size={29} color={colors.accent} strokeWidth={2} />
              </View>
              <Text
                style={styles.emptyTitle}
              >
                Brak rutyn
              </Text>
              <Text
                style={
                  styles.emptyDescription
                }
              >
                Stwórz swoją pierwszą
                rutynę i dodaj czynności,
                które chcesz wykonywać
                razem.
              </Text>
              <Pressable
                onPress={() =>
                  router.push(
                    "/add-routine"
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.createButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <View style={styles.buttonContent}>
                  <Plus size={18} color={colors.surface} strokeWidth={2.2} />
                  <Text style={styles.createButtonText}>Utwórz rutynę</Text>
                </View>
              </Pressable>
            </View>
          ) : todayRoutines.length ===
            0 ? (
            // =========================
            // SĄ RUTYNY, ALE NIE DZISIAJ
            // =========================
            <View
              style={
                styles.noTodayCard
              }
            >
              <CircleCheckBig size={27} color={colors.accent} strokeWidth={2} />
              <Text
                style={
                  styles.noTodayTitle
                }
              >
                Brak rutyn na dziś
              </Text>
              <Text
                style={
                  styles.noTodayText
                }
              >
                Masz aktywne rutyny, ale
                żadna z nich nie jest
                zaplanowana na dzisiejszy
                dzień.
              </Text>
            </View>
          ) : (
            // =========================
            // LISTA RUTYN
            // =========================
            <View
              style={
                styles.routinesContainer
              }
            >
              {todayRoutines.map(
                (routine) => {
                  const completedCount =
                    getRoutineCompletedCount(
                      routine.id,
                      todayKey
                    );
                  const totalSteps =
                    routine.steps.length;
                  const progress =
                    totalSteps > 0
                      ? Math.round(
                          (completedCount /
                            totalSteps) *
                            100
                        )
                      : 0;
                  const isCompleted =
                    totalSteps > 0 &&
                    completedCount ===
                      totalSteps;
                  const sortedSteps = [
                    ...routine.steps,
                  ].sort(
                    (a, b) =>
                      a.order - b.order
                  );
                  return (
                    <View
                      key={routine.id}
                      style={
                        styles.routineCard
                      }
                    >
                      {/* ================= */}
                      {/* HEADER RUTYNY */}
                      {/* KLIK → SZCZEGÓŁY */}
                      {/* ================= */}
                      <Pressable
                        onPress={() => {
                          router.push({
                            pathname:
                              "/routine/[id]",
                            params: {
                              id: routine.id,
                            },
                          });
                        }}
                        style={({
                          pressed,
                        }) => [
                          styles.routineHeader,
                          pressed &&
                            styles.routineHeaderPressed,
                        ]}
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
                            size={21}
                            color={routine.color}
                          />
                        </View>
                        <View
                          style={
                            styles.routineHeaderContent
                          }
                        >
                          <Text
                            style={
                              styles.routineName
                            }
                          >
                            {routine.name}
                          </Text>
                          <Text
                            style={
                              styles.routineMeta
                            }
                          >
                            {getTimeOfDayLabel(
                              routine.timeOfDay
                            )}
                            {"  ·  "}
                            {totalSteps}{" "}
                            {totalSteps === 1
                              ? "czynność"
                              : "czynności"}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.routineCounter,
                            isCompleted && {
                              backgroundColor:
                                routine.color,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.routineCounterText,
                              {
                                color:
                                  isCompleted
                                    ? colors.surface
                                    : routine.color,
                              },
                            ]}
                          >
                            {completedCount}/
                            {totalSteps}
                          </Text>
                        </View>
                        <ChevronRight size={21} color={colors.textMuted} strokeWidth={2} />
                      </Pressable>
                      {/* ================= */}
                      {/* PROGRESS */}
                      {/* ================= */}
                      <View
                        style={
                          styles.progressSection
                        }
                      >
                        <View
                          style={
                            styles.progressHeader
                          }
                        >
                          <Text
                            style={
                              styles.progressLabel
                            }
                          >
                            {isCompleted
                              ? "Rutyna ukończona"
                              : "Dzisiejszy postęp"}
                          </Text>
                          <Text
                            style={[
                              styles.progressPercent,
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
                            styles.progressTrack
                          }
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progress}%`,
                                backgroundColor:
                                  routine.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                      {/* ================= */}
                      {/* CHECKLISTA */}
                      {/* ================= */}
                      <View
                        style={
                          styles.stepsContainer
                        }
                      >
                        {sortedSteps.map(
                          (
                            step,
                            index
                          ) => {
                            const completed =
                              isStepCompleted(
                                routine.id,
                                step.id,
                                todayKey
                              );
                            return (
                              <View
                                key={
                                  step.id
                                }
                              >
                                <Pressable
                                  onPress={() =>
                                    toggleStep(
                                      routine.id,
                                      step.id,
                                      todayKey
                                    )
                                  }
                                  style={({
                                    pressed,
                                  }) => [
                                    styles.stepRow,
                                    pressed && {
                                      opacity:
                                        0.6,
                                    },
                                  ]}
                                >
                                  <View
                                    style={[
                                      styles.checkbox,
                                      completed && {
                                        backgroundColor:
                                          routine.color,
                                        borderColor:
                                          routine.color,
                                      },
                                    ]}
                                  >
                                    {completed && <Check size={15} color={colors.surface} strokeWidth={2.5} />}
                                  </View>
                                  <Text
                                    style={[
                                      styles.stepName,
                                      completed &&
                                        styles.stepNameCompleted,
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
                                      styles.stepDivider
                                    }
                                  />
                                )}
                              </View>
                            );
                          }
                        )}
                      </View>
                      {/* ================= */}
                      {/* FOOTER */}
                      {/* ================= */}
                      {isCompleted && (
                        <View
                          style={[
                            styles.completedBanner,
                            {
                              backgroundColor:
                                `${routine.color}12`,
                            },
                          ]}
                        >
                          <View style={styles.completedBannerContent}>
                            <CheckCircle2 size={16} color={routine.color} strokeWidth={2.2} />
                            <Text style={[styles.completedBannerText, { color: routine.color }]}>
                              Wszystkie czynności wykonane
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                }
              )}
            </View>
          )}
          {/* ========================= */}
          {/* INFO */}
          {/* ========================= */}
          <View style={styles.infoCard}>
            <View
              style={styles.infoIcon}
            >
              <Info size={19} color={colors.accent} strokeWidth={2} />
            </View>
            <View
              style={
                styles.infoContent
              }
            >
              <Text
                style={styles.infoTitle}
              >
                Dzisiejsze rutyny
              </Text>
              <Text
                style={styles.infoText}
              >
                Zaznaczaj czynności w
                trakcie dnia. Jutro
                otrzymasz nową checklistę,
                a dzisiejszy postęp
                pozostanie zapisany.
              </Text>
            </View>
          </View>
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
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 35,
  },
  // =========================
  // HEADER
  // =========================
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    paddingRight: 15,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 260,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 30,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  completedBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pressed: {
    opacity: 0.65,
  },
  // =========================
  // SUMMARY
  // =========================
  summaryRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 26,
  },
  summaryCard: {
    flex: 1,
    minHeight: 84,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryNumber: {
    color: colors.accent,
    fontSize: 23,
    fontWeight: "800",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
  // =========================
  // SECTION
  // =========================
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  sectionCounter: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  // =========================
  // ROUTINES
  // =========================
  routinesContainer: {
    gap: 14,
    marginBottom: 18,
  },
  routineCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  routineHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
  },
  routineHeaderPressed: {
    opacity: 0.6,
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
  routineHeaderContent: {
    flex: 1,
  },
  routineName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  routineMeta: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  routineCounter: {
    minWidth: 46,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  routineCounterText: {
    fontSize: 11,
    fontWeight: "800",
  },
  detailsArrow: {
    color: colors.textMuted,
    fontSize: 25,
    fontWeight: "400",
    marginLeft: 7,
    marginTop: -2,
  },
  // =========================
  // PROGRESS
  // =========================
  progressSection: {
    marginTop: 17,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  // =========================
  // STEPS
  // =========================
  stepsContainer: {
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    overflow: "hidden",
  },
  stepRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  checkbox: {
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
  checkmark: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  stepName: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  stepNameCompleted: {
    color: colors.textMuted,
    textDecorationLine:
      "line-through",
  },
  stepDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
  // =========================
  // COMPLETED
  // =========================
  completedBanner: {
    minHeight: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  completedBannerText: {
    fontSize: 11,
    fontWeight: "700",
  },
  // =========================
  // EMPTY
  // =========================
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 26,
    marginBottom: 18,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    color: colors.accent,
    fontSize: 29,
    fontWeight: "600",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 285,
    marginTop: 7,
  },
  createButton: {
    minHeight: 46,
    paddingHorizontal: 19,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "700",
  },
  // =========================
  // NO TODAY
  // =========================
  noTodayCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    padding: 24,
    marginBottom: 18,
  },
  noTodayIcon: {
    color: colors.accent,
    fontSize: 25,
    fontWeight: "800",
  },
  noTodayTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 9,
  },
  noTodayText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 280,
    marginTop: 6,
  },
  // =========================
  // INFO
  // =========================
  infoCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 19,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoIconText: {
    color: colors.accent,
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  // =========================
  // LOADING
  // =========================
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  });
}
