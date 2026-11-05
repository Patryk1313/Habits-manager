import { useState } from "react";

import {
  Alert,
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
import { requestHabitNotificationPermission } from "../utils/habit-notifications";

export type HabitReminder = {
  enabled: boolean;
  hour: number;
  minute: number;
};

type Props = {
  visible: boolean;
  value: HabitReminder;
  onSelect: (reminder: HabitReminder) => void;
  onClose: () => void;
};

const quickTimes = [
  { hour: 7, minute: 0 },
  { hour: 9, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 21, minute: 0 },
  { hour: 22, minute: 0 },
];

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function getReminderLabel(
  reminder: HabitReminder
) {
  if (!reminder.enabled) {
    return "Wyłączone";
  }

  return `${pad(reminder.hour)}:${pad(
    reminder.minute
  )}`;
}

export default function ReminderPicker({
  visible,
  value,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [draft, setDraft] =
    useState<HabitReminder>(value);

  const [wasVisible, setWasVisible] = useState(visible);
  const [lastValue, setLastValue] = useState(value);

  if (visible !== wasVisible || value !== lastValue) {
    setWasVisible(visible);
    setLastValue(value);
    if (visible) {
      setDraft(value);
    }
  }

  const setEnabled = (enabled: boolean) => {
    setDraft((current) => ({
      ...current,
      enabled,
    }));
  };

  const changeHour = (amount: number) => {
    setDraft((current) => {
      let newHour = current.hour + amount;

      if (newHour > 23) {
        newHour = 0;
      }

      if (newHour < 0) {
        newHour = 23;
      }

      return {
        ...current,
        hour: newHour,
      };
    });
  };

  const changeMinute = (amount: number) => {
    setDraft((current) => {
      let newMinute = current.minute + amount;
      let newHour = current.hour;

      if (newMinute >= 60) {
        newMinute = 0;
        newHour =
          newHour === 23 ? 0 : newHour + 1;
      }

      if (newMinute < 0) {
        newMinute = 55;
        newHour =
          newHour === 0 ? 23 : newHour - 1;
      }

      return {
        ...current,
        hour: newHour,
        minute: newMinute,
      };
    });
  };

  const setQuickTime = (
    hour: number,
    minute: number
  ) => {
    setDraft({
      enabled: true,
      hour,
      minute,
    });
  };

  const save = async () => {
    if (
      draft.enabled &&
      !(await requestHabitNotificationPermission())
    ) {
      Alert.alert(
        "Powiadomienia wyłączone",
        "Zezwól aplikacji na powiadomienia w ustawieniach urządzenia, aby otrzymywać przypomnienia."
      );
      return;
    }

    onSelect(draft);
    onClose();
  };

  const formattedTime = `${pad(
    draft.hour
  )}:${pad(draft.minute)}`;

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

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Przypomnienie
              </Text>

              <Text style={styles.subtitle}>
                Ustaw godzinę przypomnienia o
                wykonaniu nawyku.
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
            contentContainerStyle={
              styles.content
            }
          >
            {/* TRYB */}

            <Text style={styles.sectionLabel}>
              PRZYPOMNIENIE
            </Text>

            <Pressable
              onPress={() =>
                setEnabled(false)
              }
              style={[
                styles.optionCard,
                !draft.enabled &&
                  styles.optionCardActive,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  !draft.enabled &&
                    styles.optionIconActive,
                ]}
              >
                <Text
                  style={styles.optionIconText}
                >
                  ○
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Wyłączone
                </Text>

                <Text
                  style={styles.optionSubtitle}
                >
                  Bez powiadomienia
                </Text>
              </View>

              <Radio selected={!draft.enabled} />
            </Pressable>

            <Pressable
              onPress={() =>
                setEnabled(true)
              }
              style={[
                styles.optionCard,
                draft.enabled &&
                  styles.optionCardActive,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  draft.enabled &&
                    styles.optionIconActive,
                ]}
              >
                <Text
                  style={styles.optionIconText}
                >
                  ♢
                </Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Włączone
                </Text>

                <Text
                  style={styles.optionSubtitle}
                >
                  Przypomnij mi o nawyku
                </Text>
              </View>

              <Radio selected={draft.enabled} />
            </Pressable>

            {/* GODZINA */}

            {draft.enabled && (
              <>
                <Text style={styles.timeLabel}>
                  GODZINA
                </Text>

                <View style={styles.timeCard}>
                  {/* GODZINA */}

                  <View
                    style={styles.timeColumn}
                  >
                    <Pressable
                      style={
                        styles.timeControlButton
                      }
                      onPress={() =>
                        changeHour(1)
                      }
                    >
                      <Text
                        style={
                          styles.timeControlText
                        }
                      >
                        +
                      </Text>
                    </Pressable>

                    <View
                      style={styles.timeValueBox}
                    >
                      <Text
                        style={styles.timeValue}
                      >
                        {pad(draft.hour)}
                      </Text>
                    </View>

                    <Pressable
                      style={
                        styles.timeControlButton
                      }
                      onPress={() =>
                        changeHour(-1)
                      }
                    >
                      <Text
                        style={
                          styles.timeControlText
                        }
                      >
                        −
                      </Text>
                    </Pressable>

                    <Text
                      style={styles.timeCaption}
                    >
                      godzina
                    </Text>
                  </View>

                  {/* DWUKROPEK */}

                  <Text style={styles.colon}>
                    :
                  </Text>

                  {/* MINUTA */}

                  <View
                    style={styles.timeColumn}
                  >
                    <Pressable
                      style={
                        styles.timeControlButton
                      }
                      onPress={() =>
                        changeMinute(5)
                      }
                    >
                      <Text
                        style={
                          styles.timeControlText
                        }
                      >
                        +
                      </Text>
                    </Pressable>

                    <View
                      style={styles.timeValueBox}
                    >
                      <Text
                        style={styles.timeValue}
                      >
                        {pad(draft.minute)}
                      </Text>
                    </View>

                    <Pressable
                      style={
                        styles.timeControlButton
                      }
                      onPress={() =>
                        changeMinute(-5)
                      }
                    >
                      <Text
                        style={
                          styles.timeControlText
                        }
                      >
                        −
                      </Text>
                    </Pressable>

                    <Text
                      style={styles.timeCaption}
                    >
                      minuta
                    </Text>
                  </View>
                </View>

                {/* SZYBKI WYBÓR */}

                <Text
                  style={styles.quickLabel}
                >
                  SZYBKI WYBÓR
                </Text>

                <View style={styles.quickRow}>
                  {quickTimes.map((time) => {
                    const selected =
                      draft.hour === time.hour &&
                      draft.minute ===
                        time.minute;

                    const label = `${pad(
                      time.hour
                    )}:${pad(time.minute)}`;

                    return (
                      <Pressable
                        key={label}
                        onPress={() =>
                          setQuickTime(
                            time.hour,
                            time.minute
                          )
                        }
                        style={[
                          styles.quickButton,
                          selected &&
                            styles.quickButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quickButtonText,
                            selected &&
                              styles.quickButtonTextActive,
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* PODGLĄD */}

                <Text
                  style={styles.previewLabel}
                >
                  PODGLĄD
                </Text>

                <View
                  style={styles.previewCard}
                >
                  <View
                    style={styles.previewIcon}
                  >
                    <Text
                      style={
                        styles.previewIconText
                      }
                    >
                      ♢
                    </Text>
                  </View>

                  <View
                    style={
                      styles.previewContent
                    }
                  >
                    <Text
                      style={
                        styles.previewSmall
                      }
                    >
                      Przypomnienie
                    </Text>

                    <Text
                      style={
                        styles.previewTime
                      }
                    >
                      {formattedTime}
                    </Text>

                    <Text
                      style={
                        styles.previewDescription
                      }
                    >
                      W dni zaplanowanego
                      nawyku
                    </Text>
                  </View>
                </View>
              </>
            )}

            {!draft.enabled && (
              <>
                <Text
                  style={styles.previewLabel}
                >
                  PODGLĄD
                </Text>

                <View
                  style={
                    styles.disabledPreview
                  }
                >
                  <View
                    style={
                      styles.disabledIcon
                    }
                  >
                    <Text
                      style={
                        styles.disabledIconText
                      }
                    >
                      ○
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.disabledTitle
                      }
                    >
                      Brak przypomnienia
                    </Text>

                    <Text
                      style={
                        styles.disabledDescription
                      }
                    >
                      Nie otrzymasz powiadomienia
                      o tym nawyku.
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* INFO */}

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Text
                  style={styles.infoIconText}
                >
                  i
                </Text>
              </View>

              <Text style={styles.infoText}>
                Przypomnienie będzie powiązane z
                harmonogramem nawyku. Jeśli nawyk
                jest zaplanowany np. na poniedziałek,
                środę i piątek, przypomnienie będzie
                dotyczyło tych dni.
              </Text>
            </View>

            {/* ZAPIS */}

            <Pressable
              style={styles.saveButton}
              onPress={save}
            >
              <Text
                style={styles.saveButtonText}
              >
                Zapisz przypomnienie
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

    backgroundColor:
      "rgba(15, 15, 20, 0.42)",
  },

  sheet: {
    height: "88%",

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
    minHeight: 76,

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

  timeLabel: {
    color: colors.textMuted,

    fontSize: 10,
    fontWeight: "700",

    letterSpacing: 0.8,

    marginLeft: 4,

    marginTop: 16,
    marginBottom: 10,
  },

  timeCard: {
    minHeight: 190,

    backgroundColor: colors.surface,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 18,

    marginBottom: 18,
  },

  timeColumn: {
    alignItems: "center",
  },

  timeControlButton: {
    width: 48,
    height: 38,

    borderRadius: 12,

    backgroundColor: colors.accentSoft,

    alignItems: "center",
    justifyContent: "center",

    marginVertical: 6,
  },

  timeControlText: {
    color: colors.accent,

    fontSize: 22,
    fontWeight: "600",
  },

  timeValueBox: {
    width: 78,
    height: 60,

    borderRadius: 16,

    backgroundColor: colors.surfaceSecondary,

    alignItems: "center",
    justifyContent: "center",
  },

  timeValue: {
    color: colors.text,

    fontSize: 30,
    fontWeight: "700",

    letterSpacing: -0.5,
  },

  colon: {
    color: colors.textSecondary,

    fontSize: 30,
    fontWeight: "700",

    marginHorizontal: 12,

    marginBottom: 17,
  },

  timeCaption: {
    color: colors.textMuted,

    fontSize: 10,

    marginTop: 3,
  },

  quickLabel: {
    color: colors.textMuted,

    fontSize: 10,
    fontWeight: "700",

    letterSpacing: 0.8,

    marginLeft: 4,

    marginBottom: 9,
  },

  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 8,

    marginBottom: 20,
  },

  quickButton: {
    minWidth: 64,
    height: 38,

    paddingHorizontal: 12,

    borderRadius: 12,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    alignItems: "center",
    justifyContent: "center",
  },

  quickButtonActive: {
    backgroundColor: colors.accent,

    borderColor: colors.accent,
  },

  quickButtonText: {
    color: colors.textSecondary,

    fontSize: 12,
    fontWeight: "600",
  },

  quickButtonTextActive: {
    color: colors.accentForeground,
  },

  previewLabel: {
    color: colors.textMuted,

    fontSize: 10,
    fontWeight: "700",

    letterSpacing: 0.8,

    marginLeft: 4,

    marginBottom: 9,
  },

  previewCard: {
    minHeight: 88,

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

    fontSize: 22,
    fontWeight: "700",
  },

  previewContent: {
    flex: 1,
  },

  previewSmall: {
    color: colors.textSecondary,

    fontSize: 10,
    fontWeight: "600",
  },

  previewTime: {
    color: colors.text,

    fontSize: 20,
    fontWeight: "700",

    marginTop: 1,
  },

  previewDescription: {
    color: colors.textSecondary,

    fontSize: 11,

    marginTop: 1,
  },

  disabledPreview: {
    minHeight: 78,

    backgroundColor: colors.surface,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    marginBottom: 12,
  },

  disabledIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: colors.surfaceSecondary,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  disabledIconText: {
    color: colors.textMuted,

    fontSize: 20,
  },

  disabledTitle: {
    color: colors.text,

    fontSize: 14,
    fontWeight: "700",
  },

  disabledDescription: {
    color: colors.textMuted,

    fontSize: 11,

    marginTop: 3,
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