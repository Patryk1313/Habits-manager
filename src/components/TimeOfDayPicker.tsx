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

export type TimeOfDayType =
  | "anytime"
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export type HabitTimeOfDay = {
  type: TimeOfDayType;
};

type Props = {
  visible: boolean;
  value: HabitTimeOfDay;
  onSelect: (timeOfDay: HabitTimeOfDay) => void;
  onClose: () => void;
};

type TimeOption = {
  id: TimeOfDayType;
  name: string;
  description: string;
  icon: string;
  range: string;
};

const timeOptions: TimeOption[] = [
  {
    id: "anytime",
    name: "Dowolna",
    description: "Wykonaj nawyk o dowolnej porze",
    icon: "○",
    range: "Cały dzień",
  },
  {
    id: "morning",
    name: "Rano",
    description: "Dobry moment na rozpoczęcie dnia",
    icon: "☀",
    range: "05:00 – 11:59",
  },
  {
    id: "afternoon",
    name: "Południe",
    description: "W ciągu dnia",
    icon: "◐",
    range: "12:00 – 16:59",
  },
  {
    id: "evening",
    name: "Wieczór",
    description: "Po zakończeniu dnia",
    icon: "◒",
    range: "17:00 – 21:59",
  },
  {
    id: "night",
    name: "Noc",
    description: "Przed snem lub późnym wieczorem",
    icon: "☾",
    range: "22:00 – 04:59",
  },
];

export function getTimeOfDayLabel(
  value: HabitTimeOfDay
) {
  const option = timeOptions.find(
    (item) => item.id === value.type
  );

  return option?.name ?? "Dowolna";
}

export default function TimeOfDayPicker({
  visible,
  value,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [draft, setDraft] =
    useState<HabitTimeOfDay>(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const selectedOption =
    timeOptions.find(
      (option) => option.id === draft.type
    ) ?? timeOptions[0];

  const selectOption = (
    type: TimeOfDayType
  ) => {
    setDraft({
      type,
    });
  };

  const save = () => {
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
          {/* UCHWYT */}

          <View style={styles.handle} />

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Pora dnia
              </Text>

              <Text style={styles.subtitle}>
                Kiedy najczęściej chcesz wykonywać
                ten nawyk?
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
            {/* OPCJE */}

            <Text style={styles.sectionLabel}>
              WYBIERZ PORĘ DNIA
            </Text>

            {timeOptions.map((option) => {
              const selected =
                draft.type === option.id;

              return (
                <Pressable
                  key={option.id}
                  onPress={() =>
                    selectOption(option.id)
                  }
                  style={[
                    styles.optionCard,
                    selected &&
                      styles.optionCardActive,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      selected &&
                        styles.optionIconActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionIconText,
                        selected &&
                          styles.optionIconTextActive,
                      ]}
                    >
                      {option.icon}
                    </Text>
                  </View>

                  <View
                    style={styles.optionContent}
                  >
                    <View
                      style={styles.optionTitleRow}
                    >
                      <Text
                        style={styles.optionTitle}
                      >
                        {option.name}
                      </Text>

                      <Text
                        style={styles.optionRange}
                      >
                        {option.range}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.optionDescription
                      }
                    >
                      {option.description}
                    </Text>
                  </View>

                  <Radio selected={selected} />
                </Pressable>
              );
            })}

            {/* PODGLĄD */}

            <Text style={styles.previewLabel}>
              PODGLĄD
            </Text>

            <View style={styles.previewCard}>
              <View style={styles.previewIcon}>
                <Text
                  style={styles.previewIconText}
                >
                  {selectedOption.icon}
                </Text>
              </View>

              <View style={styles.previewContent}>
                <Text
                  style={styles.previewSmall}
                >
                  Pora dnia
                </Text>

                <Text
                  style={styles.previewTitle}
                >
                  {selectedOption.name}
                </Text>

                <Text
                  style={styles.previewRange}
                >
                  {selectedOption.range}
                </Text>
              </View>
            </View>

            {/* INFORMACJA */}

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  i
                </Text>
              </View>

              <Text style={styles.infoText}>
                Pora dnia pomoże uporządkować nawyki
                na ekranie głównym. Przypomnienie
                ustawimy osobno.
              </Text>
            </View>

            {/* ZAPISZ */}

            <Pressable
              style={styles.saveButton}
              onPress={save}
            >
              <Text
                style={styles.saveButtonText}
              >
                Zapisz porę dnia
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
    height: "82%",
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
    paddingRight: 12,
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
    lineHeight: 18,

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

  sectionLabel: {
    color: colors.textMuted,

    fontSize: 10,
    fontWeight: "700",

    letterSpacing: 0.8,

    marginLeft: 4,
    marginBottom: 10,
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
    paddingVertical: 10,

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
    color: colors.textSecondary,

    fontSize: 22,
    fontWeight: "600",
  },

  optionIconTextActive: {
    color: colors.accent,
  },

  optionContent: {
    flex: 1,
  },

  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",

    flexWrap: "wrap",
  },

  optionTitle: {
    color: colors.text,

    fontSize: 15,
    fontWeight: "700",

    marginRight: 7,
  },

  optionRange: {
    color: colors.textMuted,

    fontSize: 10,
    fontWeight: "600",
  },

  optionDescription: {
    color: colors.textSecondary,

    fontSize: 11,
    lineHeight: 15,

    marginTop: 3,

    paddingRight: 4,
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

  previewLabel: {
    color: colors.textMuted,

    fontSize: 10,
    fontWeight: "700",

    letterSpacing: 0.8,

    marginLeft: 4,

    marginTop: 14,
    marginBottom: 9,
  },

  previewCard: {
    minHeight: 82,

    backgroundColor: colors.accentSoft,

    borderRadius: 19,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    marginBottom: 12,
  },

  previewIcon: {
    width: 50,
    height: 50,

    borderRadius: 16,

    backgroundColor: colors.surface,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  previewIconText: {
    color: colors.accent,

    fontSize: 24,
  },

  previewContent: {
    flex: 1,
  },

  previewSmall: {
    color: colors.textSecondary,

    fontSize: 10,
    fontWeight: "600",
  },

  previewTitle: {
    color: colors.text,

    fontSize: 16,
    fontWeight: "700",

    marginTop: 1,
  },

  previewRange: {
    color: colors.textSecondary,

    fontSize: 11,

    marginTop: 2,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",

    backgroundColor: colors.surface,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: colors.border,

    padding: 13,

    marginBottom: 18,
  },

  infoIcon: {
    width: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor: colors.accentSoft,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  infoIconText: {
    color: colors.accent,

    fontSize: 13,
    fontWeight: "800",
  },

  infoText: {
    flex: 1,

    color: colors.textSecondary,

    fontSize: 11,
    lineHeight: 16,
  },

  saveButton: {
    minHeight: 56,

    borderRadius: 18,

    backgroundColor: colors.accent,

    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: colors.accentForeground,

    fontSize: 15,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 40,
  },
  });
}