import { useRouter } from "expo-router";
import { useState } from "react";

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import ColorHuePicker from "../components/ColorHuePicker";
import HabitIcon from "../components/HabitIcon";
import HabitIconPicker, {
  getHabitIconLabel,
  getSelectedHabitIconName,
} from "../components/HabitIconPicker";

import { useRoutines } from "../context/RoutinesContext";
import { getHueFromHex, hueToHex } from "../utils/hue-color";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";

import {
  Routine,
  RoutineStep,
  RoutineTimeOfDay,
} from "../types/routine";

// =========================
// DNI TYGODNIA
// =========================

const weekDays = [
  { id: 1, short: "Pn" },
  { id: 2, short: "Wt" },
  { id: 3, short: "Śr" },
  { id: 4, short: "Cz" },
  { id: 5, short: "Pt" },
  { id: 6, short: "Sb" },
  { id: 0, short: "Nd" },
];

// =========================
// PORY DNIA
// =========================

const timeOptions: {
  id: RoutineTimeOfDay;
  label: string;
  icon: string;
}[] = [
  {
    id: "morning",
    label: "Rano",
    icon: "☀",
  },
  {
    id: "afternoon",
    label: "Popołudnie",
    icon: "◐",
  },
  {
    id: "evening",
    label: "Wieczór",
    icon: "◒",
  },
  {
    id: "night",
    label: "Noc",
    icon: "☾",
  },
  {
    id: "anytime",
    label: "Dowolnie",
    icon: "○",
  },
];

// =========================
// SCREEN
// =========================

export default function AddRoutineScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);

  const { addRoutine } =
    useRoutines();

  // =========================
  // PODSTAWOWE DANE
  // =========================

  const [name, setName] =
    useState("");

  const [
    timeOfDay,
    setTimeOfDay,
  ] = useState<RoutineTimeOfDay>(
    "morning"
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

  const [color, setColor] =
    useState("#7668CF");
  const [icon, setIcon] = useState("CircleCheck");
  const [iconPickerVisible, setIconPickerVisible] =
    useState(false);

  // =========================
  // CZYNNOŚCI
  // =========================

  const [
    steps,
    setSteps,
  ] = useState<RoutineStep[]>([]);

  const [
    newStepName,
    setNewStepName,
  ] = useState("");

  // =========================
  // WALIDACJA
  // =========================

  const canCreate =
    name.trim().length > 0 &&
    steps.length > 0 &&
    (frequencyType === "daily" ||
      selectedDays.length > 0);

  // =========================
  // DNI
  // =========================

  const toggleDay = (
    day: number
  ) => {
    setSelectedDays(
      (currentDays) => {
        if (
          currentDays.includes(day)
        ) {
          return currentDays.filter(
            (item) => item !== day
          );
        }

        return [
          ...currentDays,
          day,
        ];
      }
    );
  };

  // =========================
  // DODAWANIE CZYNNOŚCI
  // =========================

  const addStep = () => {
    const trimmedName =
      newStepName.trim();

    if (!trimmedName) {
      return;
    }

    const newStep: RoutineStep = {
      id: `step-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,

      name: trimmedName,

      order: steps.length,
    };

    setSteps(
      (currentSteps) => [
        ...currentSteps,
        newStep,
      ]
    );

    setNewStepName("");
  };

  // =========================
  // USUWANIE CZYNNOŚCI
  // =========================

  const removeStep = (
    stepId: string
  ) => {
    setSteps((currentSteps) =>
      currentSteps
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
  // PRZESUWANIE W GÓRĘ
  // =========================

  const moveStepUp = (
    index: number
  ) => {
    if (index <= 0) {
      return;
    }

    setSteps(
      (currentSteps) => {
        const updated = [
          ...currentSteps,
        ];

        [
          updated[index - 1],
          updated[index],
        ] = [
          updated[index],
          updated[index - 1],
        ];

        return updated.map(
          (step, stepIndex) => ({
            ...step,
            order: stepIndex,
          })
        );
      }
    );
  };

  // =========================
  // PRZESUWANIE W DÓŁ
  // =========================

  const moveStepDown = (
    index: number
  ) => {
    setSteps(
      (currentSteps) => {
        if (
          index >=
          currentSteps.length - 1
        ) {
          return currentSteps;
        }

        const updated = [
          ...currentSteps,
        ];

        [
          updated[index],
          updated[index + 1],
        ] = [
          updated[index + 1],
          updated[index],
        ];

        return updated.map(
          (step, stepIndex) => ({
            ...step,
            order: stepIndex,
          })
        );
      }
    );
  };

  // =========================
  // TWORZENIE RUTYNY
  // =========================

  const createRoutine = () => {
    if (!canCreate) {
      return;
    }

    const newRoutine: Routine = {
      id: `routine-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      createdAt:
        new Date().toISOString(),

      name: name.trim(),

      timeOfDay,

      frequency:
        frequencyType === "daily"
          ? {
              type: "daily",
            }
          : {
              type: "selectedDays",
              selectedDays,
            },

      steps: steps.map(
        (step, index) => ({
          ...step,
          order: index,
        })
      ),

      icon,

      color,

      archived: false,
    };

    addRoutine(newRoutine);

    router.replace("/routines");
  };

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
        style={styles.safeArea}
      >
        {/* HEADER */}

        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/routines");
              }
            }}
            style={styles.backButton}
          >
            <Text
              style={styles.backText}
            >
              ‹
            </Text>
          </Pressable>

          <Text
            style={styles.topTitle}
          >
            Nowa rutyna
          </Text>

          <View
            style={styles.placeholder}
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
          {/* INTRO */}

          <View style={styles.intro}>
            <View
              style={[
                styles.mainIcon,
                {
                  backgroundColor:
                    `${color}18`,
                },
              ]}
            >
              <HabitIcon
                name={icon}
                size={30}
                color={color}
              />
            </View>

            <Text style={styles.title}>
              Stwórz rutynę
            </Text>

            <Text
              style={styles.subtitle}
            >
              Dodaj czynności, które
              chcesz wykonywać razem.
            </Text>
          </View>

          {/* NAZWA */}

          <Text
            style={styles.sectionLabel}
          >
            NAZWA
          </Text>

          <View
            style={styles.inputCard}
          >
            <Text
              style={styles.inputLabel}
            >
              Nazwa rutyny
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Np. Poranna rutyna"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={40}
            />
          </View>

          <Text style={styles.sectionLabel}>
            IKONA
          </Text>
          <Pressable
            onPress={() => setIconPickerVisible(true)}
            style={({ pressed }) => [
              styles.iconPickerRow,
              pressed && { opacity: 0.65 },
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

          {/* PORA DNIA */}

          <Text
            style={styles.sectionLabel}
          >
            PORA DNIA
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.timeRow
            }
          >
            {timeOptions.map(
              (option) => {
                const selected =
                  timeOfDay ===
                  option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() =>
                      setTimeOfDay(
                        option.id
                      )
                    }
                    style={[
                      styles.timeChip,

                      selected && {
                        backgroundColor:
                          color,

                        borderColor:
                          color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeIcon,

                        selected &&
                          styles.whiteText,
                      ]}
                    >
                      {option.icon}
                    </Text>

                    <Text
                      style={[
                        styles.timeLabel,

                        selected &&
                          styles.whiteText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {/* CZĘSTOTLIWOŚĆ */}

          <Text
            style={styles.sectionLabel}
          >
            CZĘSTOTLIWOŚĆ
          </Text>

          <View
            style={
              styles.frequencyRow
            }
          >
            <Pressable
              onPress={() =>
                setFrequencyType(
                  "daily"
                )
              }
              style={[
                styles.frequencyButton,

                frequencyType ===
                  "daily" && {
                  backgroundColor:
                    color,

                  borderColor:
                    color,
                },
              ]}
            >
              <Text
                style={[
                  styles.frequencyText,

                  frequencyType ===
                    "daily" &&
                    styles.whiteText,
                ]}
              >
                Codziennie
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setFrequencyType(
                  "selectedDays"
                )
              }
              style={[
                styles.frequencyButton,

                frequencyType ===
                  "selectedDays" && {
                  backgroundColor:
                    color,

                  borderColor:
                    color,
                },
              ]}
            >
              <Text
                style={[
                  styles.frequencyText,

                  frequencyType ===
                    "selectedDays" &&
                    styles.whiteText,
                ]}
              >
                Wybrane dni
              </Text>
            </Pressable>
          </View>

          {/* DNI */}

          {frequencyType ===
            "selectedDays" && (
            <View
              style={styles.daysRow}
            >
              {weekDays.map(
                (day) => {
                  const selected =
                    selectedDays.includes(
                      day.id
                    );

                  return (
                    <Pressable
                      key={day.id}
                      onPress={() =>
                        toggleDay(
                          day.id
                        )
                      }
                      style={[
                        styles.dayButton,

                        selected && {
                          backgroundColor:
                            color,

                          borderColor:
                            color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,

                          selected &&
                            styles.whiteText,
                        ]}
                      >
                        {day.short}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          )}

          {/* ========================= */}
          {/* CZYNNOŚCI */}
          {/* ========================= */}

          <View
            style={styles.sectionHeader}
          >
            <Text
              style={[
                styles.sectionLabel,
                styles.sectionLabelReset,
              ]}
            >
              CZYNNOŚCI
            </Text>

            <Text
              style={styles.stepCounter}
            >
              {steps.length}
            </Text>
          </View>

          {/* DODAWANIE */}

          <View
            style={styles.addStepCard}
          >
            <View
              style={[
                styles.addStepIcon,
                {
                  backgroundColor:
                    `${color}18`,
                },
              ]}
            >
              <Text
                style={[
                  styles.addStepPlus,
                  {
                    color,
                  },
                ]}
              >
                +
              </Text>
            </View>

            <TextInput
              value={newStepName}
              onChangeText={
                setNewStepName
              }
              placeholder="Dodaj czynność..."
              placeholderTextColor={colors.textMuted}
              style={
                styles.stepInput
              }
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={
                addStep
              }
            />

            <Pressable
              onPress={addStep}
              disabled={
                !newStepName.trim()
              }
              style={[
                styles.addStepButton,

                {
                  backgroundColor:
                    newStepName.trim()
                      ? color
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.addStepButtonText,

                  !newStepName.trim() && {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Dodaj
              </Text>
            </Pressable>
          </View>

          {/* LISTA CZYNNOŚCI */}

          {steps.length > 0 ? (
            <View
              style={styles.stepsCard}
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
                      {/* NUMER */}

                      <View
                        style={[
                          styles.stepNumber,

                          {
                            backgroundColor:
                              `${color}18`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumberText,

                            {
                              color,
                            },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>

                      {/* NAZWA */}

                      <View
                        style={
                          styles.stepContent
                        }
                      >
                        <Text
                          style={
                            styles.stepName
                          }
                        >
                          {step.name}
                        </Text>
                      </View>

                      {/* GÓRA */}

                      <Pressable
                        onPress={() =>
                          moveStepUp(
                            index
                          )
                        }
                        disabled={
                          index === 0
                        }
                        style={
                          styles.moveButton
                        }
                      >
                        <Text
                          style={[
                            styles.moveText,

                            index === 0 &&
                              styles.moveDisabled,
                          ]}
                        >
                          ↑
                        </Text>
                      </Pressable>

                      {/* DÓŁ */}

                      <Pressable
                        onPress={() =>
                          moveStepDown(
                            index
                          )
                        }
                        disabled={
                          index ===
                          steps.length -
                            1
                        }
                        style={
                          styles.moveButton
                        }
                      >
                        <Text
                          style={[
                            styles.moveText,

                            index ===
                              steps.length -
                                1 &&
                              styles.moveDisabled,
                          ]}
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
                          styles.removeButton
                        }
                      >
                        <Text
                          style={
                            styles.removeText
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
                          styles.divider
                        }
                      />
                    )}
                  </View>
                )
              )}
            </View>
          ) : (
            <View
              style={styles.emptySteps}
            >
              <Text
                style={
                  styles.emptyStepsTitle
                }
              >
                Brak czynności
              </Text>

              <Text
                style={
                  styles.emptyStepsText
                }
              >
                Dodaj pierwszą czynność
                do swojej rutyny.
              </Text>
            </View>
          )}

          {/* KOLOR */}

          <Text
            style={styles.sectionLabel}
          >
            KOLOR
          </Text>

          <View
            style={styles.colorPickerContainer}
          >
            <ColorHuePicker
              hue={getHueFromHex(color)}
              onChange={(hue) => setColor(hueToHex(hue))}
            />
          </View>

          {/* PODGLĄD */}

          <Text
            style={styles.sectionLabel}
          >
            PODGLĄD
          </Text>

          <View
            style={styles.previewCard}
          >
            <View
              style={[
                styles.previewIcon,
                {
                  backgroundColor:
                    `${color}18`,
                },
              ]}
            >
              <HabitIcon
                name={icon}
                size={22}
                color={color}
              />
            </View>

            <View
              style={
                styles.previewContent
              }
            >
              <Text
                style={styles.previewName}
              >
                {name.trim() ||
                  "Nazwa rutyny"}
              </Text>

              <Text
                style={
                  styles.previewDetails
                }
              >
                {steps.length}{" "}
                {steps.length === 1
                  ? "czynność"
                  : steps.length >= 2 &&
                      steps.length <= 4
                    ? "czynności"
                    : "czynności"}
                {"  ·  "}
                {
                  timeOptions.find(
                    (item) =>
                      item.id ===
                      timeOfDay
                  )?.label
                }
              </Text>
            </View>

            <View
              style={
                styles.previewProgress
              }
            >
              <Text
                style={[
                  styles.previewProgressText,
                  {
                    color,
                  },
                ]}
              >
                0/{steps.length}
              </Text>
            </View>
          </View>

          {/* UTWÓRZ */}

          <Pressable
            onPress={createRoutine}
            disabled={!canCreate}
            style={[
              styles.createButton,

              canCreate
                ? {
                    backgroundColor:
                      color,
                  }
                : styles.createButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.createButtonText,

                !canCreate &&
                  styles.createButtonTextDisabled,
              ]}
            >
              Utwórz rutynę
            </Text>
          </Pressable>

          <Text
            style={styles.footerText}
          >
            Rutynę i jej czynności
            będzie można później
            edytować.
          </Text>
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
  },

  topBar: {
    height: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2,
  },

  topTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },

  placeholder: {
    width: 42,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },

  intro: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 28,
  },

  mainIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  mainIconText: {
    fontSize: 30,
    fontWeight: "700",
  },

  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
    marginBottom: 9,
    marginTop: 8,
  },

  sectionLabelReset: {
    marginLeft: 0,
    marginBottom: 0,
    marginTop: 0,
  },

  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 11,
    marginBottom: 22,
  },

  inputLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },

  input: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 0,
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
    marginBottom: 20,
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

  timeRow: {
    gap: 8,
    paddingBottom: 22,
  },

  timeChip: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timeIcon: {
    color: colors.textSecondary,
    fontSize: 16,
  },

  timeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  whiteText: {
    color: "#FFFFFF",
  },

  frequencyRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
  },

  frequencyButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  frequencyText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  daysRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 22,
  },

  dayButton: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  dayText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 9,
  },

  stepCounter: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },

  addStepCard: {
    minHeight: 66,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginBottom: 10,
  },

  addStepIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  addStepPlus: {
    fontSize: 23,
    fontWeight: "500",
    marginTop: -2,
  },

  stepInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 10,
  },

  addStepButton: {
    minWidth: 58,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginLeft: 8,
  },

  addStepButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 22,
  },

  stepRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  stepNumberText: {
    fontSize: 12,
    fontWeight: "800",
  },

  stepContent: {
    flex: 1,
    paddingRight: 5,
  },

  stepName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },

  moveButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  moveText: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "700",
  },

  moveDisabled: {
    color: colors.textMuted,
  },

  removeButton: {
    width: 32,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },

  removeText: {
    color: colors.danger,
    fontSize: 23,
    fontWeight: "400",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
  },

  emptySteps: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 22,
  },

  emptyStepsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyStepsText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
  },

  colorPickerContainer: {
    marginBottom: 14,
  },

  previewCard: {
    minHeight: 88,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 22,
  },

  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  previewIconText: {
    fontSize: 22,
    fontWeight: "700",
  },

  previewContent: {
    flex: 1,
  },

  previewName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  previewDetails: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  previewProgress: {
    minWidth: 44,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  previewProgressText: {
    fontSize: 11,
    fontWeight: "800",
  },

  createButton: {
    minHeight: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  createButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  createButtonTextDisabled: {
    color: colors.textMuted,
  },

  footerText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 13,
  },
  });
}