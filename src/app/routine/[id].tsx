import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

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
import RoutineSkipButton from "../../components/RoutineSkipButton";
import { getRoutineDayStatus } from "../../utils/routine-status";

import { useRoutines } from "../../context/RoutinesContext";
import { useRoutineEntries } from "../../context/RoutineEntriesContext";
import {
  AppThemeColors,
  useTheme,
} from "../../context/ThemeContext";

import type {
  RoutineFrequency,
  RoutineTimeOfDay,
} from "../../types/routine";

// =========================
// DATA
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
// PORA DNIA
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
// IKONA PORY DNIA
// =========================

function getTimeOfDayIcon(
  timeOfDay: RoutineTimeOfDay
) {
  switch (timeOfDay) {
    case "morning":
      return "☀";

    case "afternoon":
      return "◐";

    case "evening":
      return "◒";

    case "night":
      return "☾";

    case "anytime":
      return "○";

    default:
      return "↻";
  }
}

// =========================
// CZĘSTOTLIWOŚĆ
// =========================

function getFrequencyLabel(
  frequency: RoutineFrequency
) {
  if (frequency.type === "daily") {
    return "Codziennie";
  }

  const labels = [
    "Nd",
    "Pn",
    "Wt",
    "Śr",
    "Cz",
    "Pt",
    "Sb",
  ];

  return frequency.selectedDays
    .map((day) => labels[day])
    .join(", ");
}

// =========================
// EKRAN
// =========================

export default function RoutineDetailsScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);

  const params =
    useLocalSearchParams<{
      id: string;
    }>();

  const routineId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  // =========================
  // CONTEXT
  // =========================

  const {
    routines,
    isLoading: routinesLoading,
  } = useRoutines();

  const {
    entries,
    isStepCompleted,
    toggleStep,
    isStepSkipped,
    isRoutineSkipped,
    isLoading: entriesLoading,
  } = useRoutineEntries();

  // =========================
  // RUTYNA
  // =========================

  const routine = routines.find(
    (item) =>
      item.id === routineId
  );

  // =========================
  // DZISIAJ
  // =========================

  const today = new Date();

  const todayKey =
    getDateKey(today);

  // =========================
  // LOADING
  // =========================

  if (
    routinesLoading ||
    entriesLoading
  ) {
    return (
      <View style={styles.screen}>
        <StatusBar
          barStyle={mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <SafeAreaView
          style={styles.safeArea}
        >
          <View
            style={
              styles.centerContainer
            }
          >
            <Text
              style={styles.loadingText}
            >
              Wczytywanie...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // =========================
  // NIE ZNALEZIONO
  // =========================

  if (!routine) {
    return (
      <View style={styles.screen}>
        <StatusBar
          barStyle={mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <SafeAreaView
          style={styles.safeArea}
        >
          <View
            style={
              styles.centerContainer
            }
          >
            <Text
              style={styles.errorTitle}
            >
              Nie znaleziono rutyny
            </Text>

            <Pressable
              onPress={() =>
                router.replace(
                  "/(tabs)/routines"
                )
              }
              style={
                styles.returnButton
              }
            >
              <Text
                style={
                  styles.returnButtonText
                }
              >
                Wróć do rutyn
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // =========================
  // KROKI
  // =========================

  const sortedSteps = [
    ...routine.steps,
  ].sort(
    (a, b) =>
      a.order - b.order
  );

  const status = getRoutineDayStatus(routine, entries, todayKey);
  const totalSteps = status.expected;
  const completedCount = status.completed;

  const progress =
    totalSteps > 0
      ? Math.round(
          (completedCount /
            totalSteps) *
            100
        )
      : 0;

  const completed = status.isCompleted;

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
        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (
                router.canGoBack()
              ) {
                router.back();
              } else {
                router.replace(
                  "/(tabs)/routines"
                );
              }
            }}
            style={({ pressed }) => [
              styles.headerButton,

              pressed &&
                styles.pressed,
            ]}
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
            numberOfLines={1}
            style={
              styles.headerTitle
            }
          >
            Rutyna
          </Text>

          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  "/edit-routine/[id]",

                params: {
                  id: routine.id,
                },
              })
            }
            style={({ pressed }) => [
              styles.headerButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.editIcon
              }
            >
              ✎
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
          {/* ========================= */}
          {/* HERO */}
          {/* ========================= */}

          <View style={styles.hero}>
            <View
              style={[
                styles.heroIcon,

                {
                  backgroundColor:
                    `${routine.color}18`,
                },
              ]}
            >
              <HabitIcon
                name={
                  routine.icon ||
                  getTimeOfDayIcon(routine.timeOfDay)
                }
                size={31}
                color={routine.color}
              />
            </View>

            <Text
              style={styles.title}
            >
              {routine.name}
            </Text>

            <View
              style={
                styles.heroMeta
              }
            >
              <Text
                style={
                  styles.heroMetaText
                }
              >
                {getTimeOfDayLabel(
                  routine.timeOfDay
                )}
              </Text>

              <View
                style={
                  styles.metaDot
                }
              />

              <Text
                style={
                  styles.heroMetaText
                }
              >
                {getFrequencyLabel(
                  routine.frequency
                )}
              </Text>
            </View>
          </View>

          {/* ========================= */}
          {/* DZISIAJ */}
          {/* ========================= */}

          <Text
            style={
              styles.sectionLabel
            }
          >
            DZISIAJ
          </Text>

          <View
            style={
              styles.progressCard
            }
          >
            <View
              style={
                styles.progressTop
              }
            >
              <View>
                <Text
                  style={
                    styles.progressTitle
                  }
                >
                  {completed
                    ? "Rutyna ukończona"
                    : "Dzisiejszy postęp"}
                </Text>

                <Text
                  style={
                    styles.progressSubtitle
                  }
                >
                  {completedCount} z{" "}
                  {totalSteps} wykonane
                </Text>
              </View>

              <Text
                style={[
                  styles.progressPercent,

                  {
                    color:
                      routine.color,
                  },
                ]}
              >
                {totalSteps > 0 ? `${progress}%` : "—"}
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

          {/* ========================= */}
          {/* CZYNNOŚCI */}
          {/* ========================= */}

          <Text
            style={
              styles.sectionLabel
            }
          >
            CZYNNOŚCI
          </Text>

          <RoutineSkipButton routineId={routine.id} date={todayKey} label={routine.name} />
          {status.skipped && <Text style={styles.stepNumber}>Pominięto rutynę</Text>}
          <View
            style={styles.stepsCard}
          >
            {sortedSteps.length ===
            0 ? (
              <View
                style={
                  styles.emptySteps
                }
              >
                <Text
                  style={
                    styles.emptyStepsText
                  }
                >
                  Ta rutyna nie ma
                  jeszcze żadnych
                  czynności.
                </Text>
              </View>
            ) : (
              sortedSteps.map(
                (
                  step,
                  index
                ) => {
                  const isCompleted =
                    isStepCompleted(
                      routine.id,
                      step.id,
                      todayKey
                    );

                  return (
                    <View
                      key={step.id}
                    >
                      <Pressable
                        disabled={isRoutineSkipped(routine.id, todayKey) || isStepSkipped(routine.id, step.id, todayKey)}
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

                          pressed &&
                            styles.pressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.checkbox,

                            isCompleted && {
                              backgroundColor:
                                routine.color,

                              borderColor:
                                routine.color,
                            },
                          ]}
                        >
                          {isCompleted && (
                            <Text
                              style={
                                styles.checkmark
                              }
                            >
                              ✓
                            </Text>
                          )}
                        </View>

                        <View
                          style={
                            styles.stepContent
                          }
                        >
                          <Text
                            style={[
                              styles.stepName,

                              isCompleted &&
                                styles.stepNameCompleted,
                            ]}
                          >
                            {step.name}
                          </Text>

                          <Text
                            style={
                              styles.stepNumber
                            }
                          >
                            Krok{" "}
                            {index + 1}
                          </Text>
                        </View>
                      </Pressable>
                      {isStepSkipped(routine.id, step.id, todayKey) && (
                        <Text style={styles.stepNumber}>Pominięto</Text>
                      )}
                      <RoutineSkipButton routineId={routine.id} stepId={step.id} date={todayKey} label={step.name} />

                      {index <
                        sortedSteps.length -
                          1 && (
                        <View
                          style={
                            styles.divider
                          }
                        />
                      )}
                    </View>
                  );
                }
              )
            )}
          </View>

          {/* ========================= */}
          {/* UKOŃCZONO */}
          {/* ========================= */}

          {completed && (
            <View
              style={[
                styles.completedCard,

                {
                  backgroundColor:
                    `${routine.color}12`,
                },
              ]}
            >
              <View
                style={[
                  styles.completedIcon,

                  {
                    backgroundColor:
                      routine.color,
                  },
                ]}
              >
                <Text
                  style={
                    styles.completedIconText
                  }
                >
                  ✓
                </Text>
              </View>

              <View
                style={
                  styles.completedContent
                }
              >
                <Text
                  style={[
                    styles.completedTitle,

                    {
                      color:
                        routine.color,
                    },
                  ]}
                >
                  Gotowe!
                </Text>

                <Text
                  style={
                    styles.completedText
                  }
                >
                  Wszystkie czynności
                  zostały dzisiaj
                  wykonane.
                </Text>
              </View>
            </View>
          )}

          {/* ========================= */}
          {/* INFORMACJE */}
          {/* ========================= */}

          <Text
            style={
              styles.sectionLabel
            }
          >
            INFORMACJE
          </Text>

          <View
            style={styles.infoCard}
          >
            <View
              style={
                styles.infoRow
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Pora dnia
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {getTimeOfDayLabel(
                  routine.timeOfDay
                )}
              </Text>
            </View>

            <View
              style={
                styles.infoDivider
              }
            />

            <View
              style={
                styles.infoRow
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Częstotliwość
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {getFrequencyLabel(
                  routine.frequency
                )}
              </Text>
            </View>

            <View
              style={
                styles.infoDivider
              }
            />

            <View
              style={
                styles.infoRow
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Liczba czynności
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {totalSteps}
              </Text>
            </View>
          </View>

          {/* ========================= */}
          {/* EDYCJA */}
          {/* ========================= */}

          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  "/edit-routine/[id]",

                params: {
                  id: routine.id,
                },
              })
            }
            style={({ pressed }) => [
              styles.editButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.editButtonText
              }
            >
              Edytuj rutynę
            </Text>
          </Pressable>

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

  // =========================
  // HEADER
  // =========================

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
    marginTop: -3,
  },

  editIcon: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "600",
  },

  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 10,
  },

  // =========================
  // CONTENT
  // =========================

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  // =========================
  // HERO
  // =========================

  hero: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 27,
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroIconText: {
    fontSize: 31,
    fontWeight: "700",
  },

  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  heroMetaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },

  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 8,
  },

  // =========================
  // SECTION
  // =========================

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.9,
    marginLeft: 4,
    marginBottom: 8,
    marginTop: 5,
  },

  // =========================
  // PROGRESS
  // =========================

  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 17,
    marginBottom: 21,
  },

  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  progressTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  progressSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  progressPercent: {
    fontSize: 22,
    fontWeight: "800",
  },

  progressTrack: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  // =========================
  // STEPS
  // =========================

  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 18,
  },

  stepRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  stepContent: {
    flex: 1,
  },

  stepName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  stepNameCompleted: {
    color: colors.textMuted,
    textDecorationLine:
      "line-through",
  },

  stepNumber: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 59,
  },

  emptySteps: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  emptyStepsText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },

  // =========================
  // COMPLETED
  // =========================

  completedCard: {
    minHeight: 72,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  completedIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  completedIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  completedContent: {
    flex: 1,
  },

  completedTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  completedText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  // =========================
  // INFO
  // =========================

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  infoRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },

  infoValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },

  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // =========================
  // EDIT
  // =========================

  editButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  editButtonText: {
    color: colors.accentForeground,
    fontSize: 14,
    fontWeight: "700",
  },

  // =========================
  // OTHER
  // =========================

  pressed: {
    opacity: 0.6,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },

  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  returnButton: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  returnButtonText: {
    color: colors.accentForeground,
    fontSize: 13,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 20,
  },
  });
}