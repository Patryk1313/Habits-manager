import { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";

export type FrequencyType =
  | "daily"
  | "selectedDays"
  | "timesPerWeek"
  | "interval";

export type WeekDay =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type HabitFrequency = {
  type: FrequencyType;
  selectedDays: WeekDay[];
  timesPerWeek: number;
  intervalDays: number;
};

type Props = {
  visible: boolean;
  value: HabitFrequency;
  onSelect: (frequency: HabitFrequency) => void;
  onClose: () => void;
};

const weekDays: {
  id: WeekDay;
  short: string;
  name: string;
}[] = [
  { id: "mon", short: "Pon", name: "Poniedziałek" },
  { id: "tue", short: "Wt", name: "Wtorek" },
  { id: "wed", short: "Śr", name: "Środa" },
  { id: "thu", short: "Czw", name: "Czwartek" },
  { id: "fri", short: "Pt", name: "Piątek" },
  { id: "sat", short: "Sob", name: "Sobota" },
  { id: "sun", short: "Nd", name: "Niedziela" },
];

export function getFrequencyLabel(
  frequency: HabitFrequency
) {
  if (frequency.type === "daily") {
    return "Codziennie";
  }

  if (frequency.type === "selectedDays") {
    if (frequency.selectedDays.length === 0) {
      return "Wybierz dni";
    }

    return weekDays
      .filter((day) =>
        frequency.selectedDays.includes(day.id)
      )
      .map((day) => day.short)
      .join(", ");
  }

  if (frequency.type === "timesPerWeek") {
    return `${frequency.timesPerWeek}× w tygodniu`;
  }

  if (frequency.intervalDays === 2) {
    return "Co 2 dni";
  }

  return `Co ${frequency.intervalDays} dni`;
}

export default function FrequencyPicker({
  visible,
  value,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [draft, setDraft] =
    useState<HabitFrequency>(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const setType = (type: FrequencyType) => {
    setDraft((current) => ({
      ...current,
      type,
    }));
  };

  const toggleDay = (day: WeekDay) => {
    setDraft((current) => {
      const exists =
        current.selectedDays.includes(day);

      return {
        ...current,
        selectedDays: exists
          ? current.selectedDays.filter(
              (item) => item !== day
            )
          : [...current.selectedDays, day],
      };
    });
  };

  const changeTimesPerWeek = (
    amount: number
  ) => {
    setDraft((current) => ({
      ...current,
      timesPerWeek: Math.min(
        7,
        Math.max(
          1,
          current.timesPerWeek + amount
        )
      ),
    }));
  };

  const changeInterval = (amount: number) => {
    setDraft((current) => ({
      ...current,
      intervalDays: Math.min(
        30,
        Math.max(
          2,
          current.intervalDays + amount
        )
      ),
    }));
  };

  const canSave =
    draft.type !== "selectedDays" ||
    draft.selectedDays.length > 0;

  const save = () => {
    if (!canSave) {
      return;
    }

    onSelect(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Częstotliwość
              </Text>

              <Text style={styles.subtitle}>
                Jak często chcesz wykonywać ten nawyk?
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* CODZIENNIE */}

            <Pressable
              style={[
                styles.optionCard,
                draft.type === "daily" &&
                  styles.optionCardActive,
              ]}
              onPress={() => setType("daily")}
            >
              <View
                style={[
                  styles.optionIcon,
                  draft.type === "daily" &&
                    styles.optionIconActive,
                ]}
              >
                <Text style={styles.optionIconText}>
                  ↻
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Codziennie
                </Text>

                <Text style={styles.optionSubtitle}>
                  Wykonuj nawyk każdego dnia
                </Text>
              </View>

              <Radio
                selected={draft.type === "daily"}
              />
            </Pressable>

            {/* WYBRANE DNI */}

            <Pressable
              style={[
                styles.optionCard,
                draft.type === "selectedDays" &&
                  styles.optionCardActive,
              ]}
              onPress={() =>
                setType("selectedDays")
              }
            >
              <View
                style={[
                  styles.optionIcon,
                  draft.type === "selectedDays" &&
                    styles.optionIconActive,
                ]}
              >
                <Text style={styles.optionIconText}>
                  ▦
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Wybrane dni
                </Text>

                <Text style={styles.optionSubtitle}>
                  Wybierz konkretne dni tygodnia
                </Text>
              </View>

              <Radio
                selected={
                  draft.type === "selectedDays"
                }
              />
            </Pressable>

            {draft.type === "selectedDays" && (
              <View style={styles.daysContainer}>
                <Text style={styles.smallLabel}>
                  DNI TYGODNIA
                </Text>

                <View style={styles.daysRow}>
                  {weekDays.map((day) => {
                    const selected =
                      draft.selectedDays.includes(
                        day.id
                      );

                    return (
                      <Pressable
                        key={day.id}
                        onPress={() =>
                          toggleDay(day.id)
                        }
                        style={[
                          styles.dayButton,
                          selected &&
                            styles.dayButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            selected &&
                              styles.dayTextActive,
                          ]}
                        >
                          {day.short}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {draft.selectedDays.length === 0 && (
                  <Text style={styles.validation}>
                    Wybierz przynajmniej jeden dzień.
                  </Text>
                )}
              </View>
            )}

            {/* X RAZY W TYGODNIU */}

            <Pressable
              style={[
                styles.optionCard,
                draft.type === "timesPerWeek" &&
                  styles.optionCardActive,
              ]}
              onPress={() =>
                setType("timesPerWeek")
              }
            >
              <View
                style={[
                  styles.optionIcon,
                  draft.type === "timesPerWeek" &&
                    styles.optionIconActive,
                ]}
              >
                <Text style={styles.optionIconText}>
                  #
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  X razy w tygodniu
                </Text>

                <Text style={styles.optionSubtitle}>
                  Liczy się liczba wykonań w tygodniu
                </Text>
              </View>

              <Radio
                selected={
                  draft.type === "timesPerWeek"
                }
              />
            </Pressable>

            {draft.type === "timesPerWeek" && (
              <View style={styles.counterCard}>
                <View>
                  <Text style={styles.counterLabel}>
                    Liczba wykonań
                  </Text>

                  <Text
                    style={styles.counterDescription}
                  >
                    w ciągu tygodnia
                  </Text>
                </View>

                <View style={styles.counterControls}>
                  <Pressable
                    style={styles.counterButton}
                    onPress={() =>
                      changeTimesPerWeek(-1)
                    }
                  >
                    <Text
                      style={styles.counterButtonText}
                    >
                      −
                    </Text>
                  </Pressable>

                  <View
                    style={styles.counterValueBox}
                  >
                    <Text
                      style={styles.counterValue}
                    >
                      {draft.timesPerWeek}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.counterButton}
                    onPress={() =>
                      changeTimesPerWeek(1)
                    }
                  >
                    <Text
                      style={styles.counterButtonText}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* CO X DNI */}

            <Pressable
              style={[
                styles.optionCard,
                draft.type === "interval" &&
                  styles.optionCardActive,
              ]}
              onPress={() => setType("interval")}
            >
              <View
                style={[
                  styles.optionIcon,
                  draft.type === "interval" &&
                    styles.optionIconActive,
                ]}
              >
                <Text style={styles.optionIconText}>
                  ↔
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Co X dni
                </Text>

                <Text style={styles.optionSubtitle}>
                  Np. co 2, 3 lub 7 dni
                </Text>
              </View>

              <Radio
                selected={
                  draft.type === "interval"
                }
              />
            </Pressable>

            {draft.type === "interval" && (
              <View style={styles.counterCard}>
                <View>
                  <Text style={styles.counterLabel}>
                    Powtarzaj
                  </Text>

                  <Text
                    style={styles.counterDescription}
                  >
                    co ile dni
                  </Text>
                </View>

                <View style={styles.counterControls}>
                  <Pressable
                    style={styles.counterButton}
                    onPress={() =>
                      changeInterval(-1)
                    }
                  >
                    <Text
                      style={styles.counterButtonText}
                    >
                      −
                    </Text>
                  </Pressable>

                  <View
                    style={styles.intervalValueBox}
                  >
                    <Text
                      style={styles.counterValue}
                    >
                      {draft.intervalDays}
                    </Text>

                    <Text style={styles.daysSuffix}>
                      dni
                    </Text>
                  </View>

                  <Pressable
                    style={styles.counterButton}
                    onPress={() =>
                      changeInterval(1)
                    }
                  >
                    <Text
                      style={styles.counterButtonText}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* PODGLĄD */}

            <Text style={styles.previewLabel}>
              PODGLĄD
            </Text>

            <View style={styles.preview}>
              <View style={styles.previewIcon}>
                <Text
                  style={styles.previewIconText}
                >
                  ↻
                </Text>
              </View>

              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>
                  Harmonogram
                </Text>

                <Text style={styles.previewValue}>
                  {getFrequencyLabel(draft)}
                </Text>
              </View>
            </View>

            {/* ZAPISZ */}

            <Pressable
              disabled={!canSave}
              onPress={save}
              style={[
                styles.saveButton,
                !canSave &&
                  styles.saveButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !canSave &&
                    styles.saveButtonTextDisabled,
                ]}
              >
                Zapisz częstotliwość
              </Text>
            </Pressable>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Radio({
  selected,
}: {
  selected: boolean;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.radio,
        selected && styles.radioSelected,
      ]}
    >
      {selected && (
        <View style={styles.radioDot} />
      )}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 15, 20, 0.42)",
  },

  sheet: {
    height: "90%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    overflow: "hidden",
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: colors.textSecondary,
    fontSize: 25,
  },

  content: {
    paddingHorizontal: 18,
  },

  optionCard: {
    minHeight: 78,
    backgroundColor: colors.surface,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  optionCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },

  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  optionIconActive: {
    backgroundColor: colors.accentSoft,
  },

  optionIconText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "700",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  radioSelected: {
    borderColor: colors.accent,
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },

  daysContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },

  smallLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },

  dayButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  dayButtonActive: {
    backgroundColor: colors.accent,
  },

  dayText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  dayTextActive: {
    color: colors.accentForeground,
  },

  validation: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 10,
  },

  counterCard: {
    minHeight: 84,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  counterLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  counterDescription: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  counterButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  counterButtonText: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "600",
  },

  counterValueBox: {
    minWidth: 44,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  intervalValueBox: {
    minWidth: 58,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  counterValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },

  daysSuffix: {
    color: colors.textMuted,
    fontSize: 10,
    marginLeft: 3,
  },

  previewLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
    marginTop: 16,
    marginBottom: 9,
  },

  preview: {
    minHeight: 72,
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  previewIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  previewIconText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "700",
  },

  previewContent: {
    flex: 1,
  },

  previewTitle: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  previewValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },

  saveButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },

  saveButtonText: {
    color: colors.accentForeground,
    fontSize: 15,
    fontWeight: "700",
  },

  saveButtonTextDisabled: {
    color: colors.textMuted,
  },

  bottomSpace: {
    height: 40,
  },
  });
}