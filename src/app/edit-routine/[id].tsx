import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import ColorHuePicker from "../../components/ColorHuePicker";
import HabitIcon from "../../components/HabitIcon";
import HabitIconPicker, {
  getHabitIconLabel,
  getSelectedHabitIconName,
} from "../../components/HabitIconPicker";
import {
  useEffect,
  useState,
} from "react";
import {
  useRoutines,
} from "../../context/RoutinesContext";
import { getHueFromHex, hueToHex } from "../../utils/hue-color";
import {
  AppThemeColors,
  useTheme,
} from "../../context/ThemeContext";
import {
  useRoutineEntries,
} from "../../context/RoutineEntriesContext";
import type {
  Routine,
  RoutineFrequency,
  RoutineStep,
  RoutineTimeOfDay,
} from "../../types/routine";
// =========================
// PORA DNIA
// =========================
const timeOptions: {
  value: RoutineTimeOfDay;
  label: string;
  icon: string;
}[] = [
  {
    value: "morning",
    label: "Rano",
    icon: "☀",
  },
  {
    value: "afternoon",
    label: "Popołudnie",
    icon: "◐",
  },
  {
    value: "evening",
    label: "Wieczór",
    icon: "◒",
  },
  {
    value: "night",
    label: "Noc",
    icon: "☾",
  },
  {
    value: "anytime",
    label: "Dowolnie",
    icon: "○",
  },
];
// =========================
// DNI TYGODNIA
// =========================
// JS:
// 0 = niedziela
// 1 = poniedziałek
// ...
// 6 = sobota
const weekDays = [
  {
    value: 1,
    label: "Pn",
  },
  {
    value: 2,
    label: "Wt",
  },
  {
    value: 3,
    label: "Śr",
  },
  {
    value: 4,
    label: "Cz",
  },
  {
    value: 5,
    label: "Pt",
  },
  {
    value: 6,
    label: "Sb",
  },
  {
    value: 0,
    label: "Nd",
  },
];
// =========================
// ID NOWEJ CZYNNOŚCI
// =========================
function createStepId() {
  return `step-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
// =========================
// SCREEN
// =========================
export default function EditRoutineScreen() {
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
    updateRoutine,
    archiveRoutine,
    removeRoutine,
    isLoading,
  } = useRoutines();
  const {
    removeEntriesForRoutine,
  } = useRoutineEntries();
  const [icon, setIcon] = useState("↻");
  const [color, setColor] = useState<string>(
    "#7668CF"
  );
  const [iconPickerVisible, setIconPickerVisible] =
    useState(false);
  // =========================
  // RUTYNA
  // =========================
  const routine =
    routines.find(
      (item) =>
        item.id === routineId
    );
  // =========================
  // FORM
  // =========================
  const [
    name,
    setName,
  ] = useState("");
  const [
    timeOfDay,
    setTimeOfDay,
  ] =
    useState<RoutineTimeOfDay>(
      "anytime"
    );
  const [
    frequencyType,
    setFrequencyType,
  ] = useState<
    "daily" | "selectedDays"
  >("daily");
  const [
    selectedDays,
    setSelectedDays,
  ] = useState<number[]>([]);
  const [
    steps,
    setSteps,
  ] = useState<RoutineStep[]>(
    []
  );
  const [
    newStepName,
    setNewStepName,
  ] = useState("");
  // =========================
  // WCZYTANIE RUTYNY DO FORM
  // =========================
  useEffect(() => {
    if (!routine) {
      return;
    }
    setName(routine.name);
    setIcon(routine.icon || "↻");
    setColor(routine.color || "#7668CF");
    setTimeOfDay(
      routine.timeOfDay
    );
    setFrequencyType(
      routine.frequency.type
    );
    if (
      routine.frequency.type ===
      "selectedDays"
    ) {
      setSelectedDays(
        routine.frequency
          .selectedDays
      );
    } else {
      setSelectedDays([]);
    }
    setSteps(
      [...routine.steps].sort(
        (a, b) =>
          a.order - b.order
      )
    );
  }, [routine]);
  // =========================
  // DZIEŃ TYGODNIA
  // =========================
  const toggleDay = (
    day: number
  ) => {
    setSelectedDays(
      (current) => {
        if (
          current.includes(day)
        ) {
          return current.filter(
            (item) =>
              item !== day
          );
        }
        return [
          ...current,
          day,
        ];
      }
    );
  };
  // =========================
  // DODAJ CZYNNOŚĆ
  // =========================
  const addStep = () => {
    const trimmedName =
      newStepName.trim();
    if (!trimmedName) {
      return;
    }
    const newStep: RoutineStep =
      {
        id: createStepId(),
        name: trimmedName,
        order: steps.length,
      };
    setSteps(
      (current) => [
        ...current,
        newStep,
      ]
    );
    setNewStepName("");
  };
  // =========================
  // USUŃ CZYNNOŚĆ
  // =========================
  const removeStep = (
    stepId: string
  ) => {
    setSteps((current) =>
      current
        .filter(
          (step) =>
            step.id !== stepId
        )
        .map(
          (step, index) => ({
            ...step,
            order: index,
          })
        )
    );
  };
  // =========================
  // PRZESUŃ CZYNNOŚĆ
  // =========================
  const moveStep = (
    index: number,
    direction: -1 | 1
  ) => {
    const newIndex =
      index + direction;
    if (
      newIndex < 0 ||
      newIndex >= steps.length
    ) {
      return;
    }
    setSteps((current) => {
      const updated = [
        ...current,
      ];
      const temporary =
        updated[index];
      updated[index] =
        updated[newIndex];
      updated[newIndex] =
        temporary;
      return updated.map(
        (step, stepIndex) => ({
          ...step,
          order: stepIndex,
        })
      );
    });
  };
  // =========================
  // ZAPIS
  // =========================
  const saveRoutine = () => {
    if (!routine) {
      return;
    }
    const trimmedName =
      name.trim();
    if (!trimmedName) {
      Alert.alert(
        "Brak nazwy",
        "Podaj nazwę rutyny."
      );
      return;
    }
    if (steps.length === 0) {
      Alert.alert(
        "Brak czynności",
        "Dodaj przynajmniej jedną czynność do rutyny."
      );
      return;
    }
    if (
      frequencyType ===
        "selectedDays" &&
      selectedDays.length === 0
    ) {
      Alert.alert(
        "Brak dni",
        "Wybierz przynajmniej jeden dzień tygodnia."
      );
      return;
    }
    let frequency:
      RoutineFrequency;
    if (
      frequencyType === "daily"
    ) {
      frequency = {
        type: "daily",
      };
    } else {
      frequency = {
        type: "selectedDays",
        selectedDays:
          selectedDays,
      };
    }
    const updatedRoutine:
      Routine = {
      ...routine,
      name: trimmedName,
      icon,
      color,
      timeOfDay,
      frequency,
      steps: steps.map(
        (step, index) => ({
          ...step,
          order: index,
        })
      ),
    };
    updateRoutine(
      updatedRoutine
    );
    // Wracamy do szczegółów.
    router.replace({
      pathname:
        "/routine/[id]",
      params: {
        id: routine.id,
      },
    });
  };
  // =========================
  // ARCHIWIZACJA
  // =========================
  const performArchive = () => {
    if (!routine) {
      return;
    }
    archiveRoutine(
      routine.id
    );
    router.replace(
      "/(tabs)/routines"
    );
  };
  const archiveCurrentRoutine =
    () => {
      Alert.alert(
        "Archiwizować rutynę?",
        "Rutyna zniknie z aktywnych rutyn. Historia wykonania pozostanie zapisana.",
        [
          {
            text: "Anuluj",
            style: "cancel",
          },
          {
            text: "Archiwizuj",
            style:
              "destructive",
            onPress:
              performArchive,
          },
        ]
      );
    };
  // =========================
  // USUWANIE RUTYNY
  // =========================
  const performDelete = () => {
    if (!routine) {
      return;
    }
    removeEntriesForRoutine(
      routine.id
    );
    removeRoutine(
      routine.id
    );
    router.replace(
      "/(tabs)/routines"
    );
  };
  const deleteCurrentRoutine =
    () => {
      if (!routine) {
        return;
      }
      Alert.alert(
        "Usunąć rutynę?",
        `„${routine.name}” oraz cała historia jej wykonania zostaną trwale usunięte. Tej operacji nie można cofnąć.`,
        [
          {
            text: "Anuluj",
            style: "cancel",
          },
          {
            text: "Usuń",
            style: "destructive",
            onPress: performDelete,
          },
        ]
      );
    };
  // =========================
  // LOADING
  // =========================
  if (isLoading) {
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
              styles.center
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
        </SafeAreaView>
      </View>
    );
  }
  // =========================
  // BRAK RUTYNY
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
              styles.center
            }
          >
            <Text
              style={
                styles.notFoundTitle
              }
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
                styles.backToRoutines
              }
            >
              <Text
                style={
                  styles.backToRoutinesText
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
                router.replace({
                  pathname:
                    "/routine/[id]",
                  params: {
                    id: routine.id,
                  },
                });
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
            style={
              styles.headerTitle
            }
          >
            Edytuj rutynę
          </Text>
          <View
            style={
              styles.headerPlaceholder
            }
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          {/* ========================= */}
          {/* NAZWA */}
          {/* ========================= */}
          <Text
            style={
              styles.sectionLabel
            }
          >
            PODSTAWOWE
          </Text>
          <View
            style={
              styles.formCard
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              Nazwa rutyny
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Np. Poranna rutyna"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
          <Text style={styles.sectionLabel}>
            IKONA
          </Text>
          <Pressable
            onPress={() => setIconPickerVisible(true)}
            style={({ pressed }) => [
              styles.iconPickerRow,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.iconPreview,
                { backgroundColor: `${color}18` },
              ]}
            >
              <HabitIcon name={icon} size={23} color={color} />
            </View>
            <View style={styles.iconPickerContent}>
              <Text style={styles.iconPickerTitle}>Ikona rutyny</Text>
              <Text style={styles.iconPickerValue}>
                {getHabitIconLabel(icon)}
              </Text>
            </View>
            <Text style={styles.iconPickerChevron}>›</Text>
          </Pressable>
          <Text style={styles.sectionLabel}>
            KOLOR
          </Text>
          <View style={styles.colorPickerContainer}>
            <ColorHuePicker
              hue={getHueFromHex(color)}
              onChange={(hue) => setColor(hueToHex(hue))}
            />
          </View>
          {/* ========================= */}
          {/* PORA DNIA */}
          {/* ========================= */}
          <Text
            style={
              styles.sectionLabel
            }
          >
            PORA DNIA
          </Text>
          <View
            style={
              styles.timeGrid
            }
          >
            {timeOptions.map(
              (option) => {
                const selected =
                  timeOfDay ===
                  option.value;
                return (
                  <Pressable
                    key={
                      option.value
                    }
                    onPress={() =>
                      setTimeOfDay(
                        option.value
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.timeOption,
                      selected &&
                        styles.timeOptionSelected,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeIcon,
                        selected &&
                          styles.timeIconSelected,
                      ]}
                    >
                      {option.icon}
                    </Text>
                    <Text
                      style={[
                        styles.timeLabel,
                        selected &&
                          styles.timeLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
          {/* ========================= */}
          {/* CZĘSTOTLIWOŚĆ */}
          {/* ========================= */}
          <Text
            style={
              styles.sectionLabel
            }
          >
            CZĘSTOTLIWOŚĆ
          </Text>
          <View
            style={
              styles.frequencyCard
            }
          >
            <Pressable
              onPress={() =>
                setFrequencyType(
                  "daily"
                )
              }
              style={
                styles.frequencyRow
              }
            >
              <View
                style={[
                  styles.radio,
                  frequencyType ===
                    "daily" &&
                    styles.radioSelected,
                ]}
              >
                {frequencyType ===
                  "daily" && (
                  <View
                    style={
                      styles.radioDot
                    }
                  />
                )}
              </View>
              <View>
                <Text
                  style={
                    styles.frequencyTitle
                  }
                >
                  Codziennie
                </Text>
                <Text
                  style={
                    styles.frequencySubtitle
                  }
                >
                  Rutyna każdego dnia
                </Text>
              </View>
            </Pressable>
            <View
              style={
                styles.divider
              }
            />
            <Pressable
              onPress={() =>
                setFrequencyType(
                  "selectedDays"
                )
              }
              style={
                styles.frequencyRow
              }
            >
              <View
                style={[
                  styles.radio,
                  frequencyType ===
                    "selectedDays" &&
                    styles.radioSelected,
                ]}
              >
                {frequencyType ===
                  "selectedDays" && (
                  <View
                    style={
                      styles.radioDot
                    }
                  />
                )}
              </View>
              <View>
                <Text
                  style={
                    styles.frequencyTitle
                  }
                >
                  Wybrane dni
                </Text>
                <Text
                  style={
                    styles.frequencySubtitle
                  }
                >
                  Wybierz dni tygodnia
                </Text>
              </View>
            </Pressable>
            {frequencyType ===
              "selectedDays" && (
              <View
                style={
                  styles.daysContainer
                }
              >
                {weekDays.map(
                  (day) => {
                    const selected =
                      selectedDays.includes(
                        day.value
                      );
                    return (
                      <Pressable
                        key={
                          day.value
                        }
                        onPress={() =>
                          toggleDay(
                            day.value
                          )
                        }
                        style={[
                          styles.dayButton,
                          selected &&
                            styles.dayButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            selected &&
                              styles.dayButtonTextSelected,
                          ]}
                        >
                          {
                            day.label
                          }
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>
            )}
          </View>
          {/* ========================= */}
          {/* CZYNNOŚCI */}
          {/* ========================= */}
          <View
            style={
              styles.stepsSectionHeader
            }
          >
            <Text
              style={
                styles.sectionLabelNoMargin
              }
            >
              CZYNNOŚCI
            </Text>
            <Text
              style={
                styles.stepsCounter
              }
            >
              {steps.length}
            </Text>
          </View>
          <View
            style={
              styles.stepsCard
            }
          >
            {steps.map(
              (step, index) => (
                <View
                  key={step.id}
                >
                  <View
                    style={
                      styles.stepRow
                    }
                  >
                    <View
                      style={
                        styles.stepNumber
                      }
                    >
                      <Text
                        style={
                          styles.stepNumberText
                        }
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={
                        styles.stepName
                      }
                    >
                      {step.name}
                    </Text>
                    {/* GÓRA */}
                    <Pressable
                      disabled={
                        index === 0
                      }
                      onPress={() =>
                        moveStep(
                          index,
                          -1
                        )
                      }
                      style={[
                        styles.stepAction,
                        index === 0 &&
                          styles.stepActionDisabled,
                      ]}
                    >
                      <Text
                        style={
                          styles.stepActionText
                        }
                      >
                        ↑
                      </Text>
                    </Pressable>
                    {/* DÓŁ */}
                    <Pressable
                      disabled={
                        index ===
                        steps.length -
                          1
                      }
                      onPress={() =>
                        moveStep(
                          index,
                          1
                        )
                      }
                      style={[
                        styles.stepAction,
                        index ===
                          steps.length -
                            1 &&
                          styles.stepActionDisabled,
                      ]}
                    >
                      <Text
                        style={
                          styles.stepActionText
                        }
                      >
                        ↓
                      </Text>
                    </Pressable>
                    {/* USUŃ */}
                    <Pressable
                      onPress={() =>
                        removeStep(
                          step.id
                        )
                      }
                      style={
                        styles.removeStep
                      }
                    >
                      <Text
                        style={
                          styles.removeStepText
                        }
                      >
                        ×
                      </Text>
                    </Pressable>
                  </View>
                  {index <
                    steps.length -
                      1 && (
                    <View
                      style={
                        styles.stepDivider
                      }
                    />
                  )}
                </View>
              )
            )}
            {/* ========================= */}
            {/* NOWA CZYNNOŚĆ */}
            {/* ========================= */}
            <View
              style={
                styles.addStepContainer
              }
            >
              <TextInput
                value={
                  newStepName
                }
                onChangeText={
                  setNewStepName
                }
                onSubmitEditing={
                  addStep
                }
                returnKeyType="done"
                placeholder="Dodaj czynność..."
                placeholderTextColor={colors.textMuted}
                style={
                  styles.stepInput
                }
              />
              <Pressable
                onPress={addStep}
                style={({
                  pressed,
                }) => [
                  styles.addStepButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.addStepButtonText
                  }
                >
                  +
                </Text>
              </Pressable>
            </View>
          </View>
          {/* ========================= */}
          {/* ZAPISZ */}
          {/* ========================= */}
          <Pressable
            onPress={
              saveRoutine
            }
            style={({
              pressed,
            }) => [
              styles.saveButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.saveButtonText
              }
            >
              Zapisz zmiany
            </Text>
          </Pressable>
          {/* ========================= */}
          {/* ARCHIWUM */}
          {/* ========================= */}
          <Pressable
            onPress={
              archiveCurrentRoutine
            }
            style={({
              pressed,
            }) => [
              styles.archiveButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.archiveButtonText
              }
            >
              Archiwizuj rutynę
            </Text>
          </Pressable>
          <Text
            style={
              styles.archiveInfo
            }
          >
            Historia wykonania rutyny
            pozostanie zapisana.
          </Text>
          {/* ========================= */}
          {/* USUWANIE */}
          {/* ========================= */}
          <View
            style={
              styles.deleteSection
            }
          >
            <Text
              style={
                styles.deleteSectionTitle
              }
            >
              STREFA NIEODWRACALNA
            </Text>
            <Pressable
              onPress={
                deleteCurrentRoutine
              }
              style={({
                pressed,
              }) => [
                styles.deleteButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.deleteButtonText
                }
              >
                Usuń rutynę
              </Text>
            </Pressable>
            <Text
              style={
                styles.deleteInfo
              }
            >
              Rutyna i cała historia jej wykonania zostaną trwale usunięte.
            </Text>
          </View>
          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>
      </SafeAreaView>
      <HabitIconPicker
        visible={iconPickerVisible}
        selectedIcon={getSelectedHabitIconName(icon)}
        onSelect={setIcon}
        onClose={() => setIconPickerVisible(false)}
      />
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
      justifyContent:
        "center",
    },
    backIcon: {
      color: colors.text,
      fontSize: 34,
      lineHeight: 36,
      marginTop: -3,
    },
    headerTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      textAlign: "center",
    },
    headerPlaceholder: {
      width: 44,
      height: 44,
    },
    // =========================
    // CONTENT
    // =========================
    content: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 30,
    },
    sectionLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.9,
      marginLeft: 4,
      marginBottom: 8,
      marginTop: 8,
    },
    sectionLabelNoMargin: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.9,
    },
    // =========================
    // BASIC
    // =========================
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      marginBottom: 20,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 8,
    },
    input: {
      minHeight: 48,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    iconPickerRow: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      marginBottom: 14,
    },
    iconPreview: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    iconPickerContent: {
      flex: 1,
    },
    iconPickerTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    iconPickerValue: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 3,
    },
    iconPickerChevron: {
      color: colors.textMuted,
      fontSize: 25,
      marginLeft: 8,
    },
    colorPickerContainer: {
      marginBottom: 14,
    },
    // =========================
    // TIME
    // =========================
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 20,
    },
    timeOption: {
      minWidth: "31%",
      flexGrow: 1,
      minHeight: 72,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 8,
    },
    timeOptionSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    timeIcon: {
      color: colors.textMuted,
      fontSize: 20,
      marginBottom: 5,
    },
    timeIconSelected: {
      color: colors.accent,
    },
    timeLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    timeLabelSelected: {
      color: colors.accent,
      fontWeight: "700",
    },
    // =========================
    // FREQUENCY
    // =========================
    frequencyCard: {
      backgroundColor: colors.surface,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 22,
    },
    frequencyRow: {
      minHeight: 67,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },
    radioSelected: {
      borderColor: colors.accent,
    },
    radioDot: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },
    frequencyTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    frequencySubtitle: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 3,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 50,
    },
    daysContainer: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      paddingHorizontal: 12,
      paddingTop: 5,
      paddingBottom: 15,
      gap: 5,
    },
    dayButton: {
      flex: 1,
      height: 37,
      borderRadius: 11,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent:
        "center",
    },
    dayButtonSelected: {
      backgroundColor: colors.accent,
    },
    dayButtonText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "700",
    },
    dayButtonTextSelected: {
      color: colors.accentForeground,
    },
    // =========================
    // STEPS
    // =========================
    stepsSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginLeft: 4,
      marginBottom: 8,
    },
    stepsCounter: {
      minWidth: 22,
      height: 20,
      borderRadius: 7,
      backgroundColor: colors.accentSoft,
      color: colors.accent,
      fontSize: 10,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 5,
    },
    stepsCard: {
      backgroundColor: colors.surface,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 20,
    },
    stepRow: {
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
    },
    stepNumber: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },
    stepNumberText: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "800",
    },
    stepName: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      paddingRight: 5,
    },
    stepAction: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent:
        "center",
    },
    stepActionDisabled: {
      opacity: 0.2,
    },
    stepActionText: {
      color: colors.textSecondary,
      fontSize: 17,
      fontWeight: "700",
    },
    removeStep: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent:
        "center",
    },
    removeStepText: {
      color: colors.danger,
      fontSize: 21,
      lineHeight: 23,
    },
    stepDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 51,
    },
    // =========================
    // ADD STEP
    // =========================
    addStepContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 11,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 9,
    },
    stepInput: {
      flex: 1,
      minHeight: 43,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      paddingHorizontal: 13,
      color: colors.text,
      fontSize: 12,
    },
    addStepButton: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent:
        "center",
    },
    addStepButtonText: {
      color: colors.accentForeground,
      fontSize: 24,
      lineHeight: 26,
    },
    // =========================
    // SAVE
    // =========================
    saveButton: {
      minHeight: 54,
      borderRadius: 17,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 3,
    },
    saveButtonText: {
      color: colors.accentForeground,
      fontSize: 14,
      fontWeight: "700",
    },
    // =========================
    // ARCHIVE
    // =========================
    archiveButton: {
      minHeight: 50,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.danger,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 12,
    },
    archiveButtonText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "700",
    },
    archiveInfo: {
      color: colors.textMuted,
      fontSize: 10,
      textAlign: "center",
      marginTop: 7,
    },
    // =========================
    // DELETE
    // =========================
    deleteSection: {
      marginTop: 28,
      paddingTop: 22,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    deleteSectionTitle: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.8,
      textAlign: "center",
      marginBottom: 10,
    },
    deleteButton: {
      minHeight: 50,
      borderRadius: 16,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.danger,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "700",
    },
    deleteInfo: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 15,
      textAlign: "center",
      marginTop: 7,
    },
    // =========================
    // OTHER
    // =========================
    pressed: {
      opacity: 0.6,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    notFoundTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    backToRoutines: {
      minHeight: 46,
      borderRadius: 14,
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 18,
    },
    backToRoutinesText: {
      color: colors.accentForeground,
      fontSize: 13,
      fontWeight: "700",
    },
    bottomSpace: {
      height: 25,
    },
    });
  }