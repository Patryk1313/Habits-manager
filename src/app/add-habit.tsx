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
import ColorPicker from "../components/ColorPicker";
import HabitIcon from "../components/HabitIcon";
import type { HabitIconName } from "../components/HabitIcon";
import HabitIconPicker, {
  getHabitIconLabel,
} from "../components/HabitIconPicker";
import FrequencyPicker, {
  getFrequencyLabel,
  HabitFrequency,
} from "../components/FrequencyPicker";
import ReminderPicker, {
  getReminderLabel,
  HabitReminder,
} from "../components/ReminderPicker";
import TimeOfDayPicker, {
  getTimeOfDayLabel,
  HabitTimeOfDay,
} from "../components/TimeOfDayPicker";
import UnitPicker from "../components/UnitPicker";
import {
  HabitColor,
  habitColors,
} from "../constants/habit-colors";
import {
  HabitUnit,
  habitUnits,
} from "../constants/habit-units";
import { useHabits } from "../context/HabitsContext";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";
import {
  Habit,
  HabitCategory,
  HabitType,
} from "../types/habit";
export default function AddHabitScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);
  // =========================
  // CONTEXT
  // =========================
  const { addHabit } = useHabits();
  // =========================
  // PODSTAWOWE DANE
  // =========================
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<HabitCategory>("Codzienne");
  // =========================
  // PLAN - CZĘSTOTLIWOŚĆ
  // =========================
  const [frequency, setFrequency] =
    useState<HabitFrequency>({
      type: "daily",
      selectedDays: [],
      timesPerWeek: 3,
      intervalDays: 2,
    });
  const [
    frequencyPickerVisible,
    setFrequencyPickerVisible,
  ] = useState(false);
  const frequencyLabel =
    getFrequencyLabel(frequency);
  // =========================
  // PLAN - PORA DNIA
  // =========================
  const [timeOfDay, setTimeOfDay] =
    useState<HabitTimeOfDay>({
      type: "anytime",
    });
  const [
    timeOfDayPickerVisible,
    setTimeOfDayPickerVisible,
  ] = useState(false);
  const timeOfDayLabel =
    getTimeOfDayLabel(timeOfDay);
  // =========================
  // PLAN - PRZYPOMNIENIE
  // =========================
  const [reminder, setReminder] =
    useState<HabitReminder>({
      enabled: false,
      hour: 21,
      minute: 0,
    });
  const [
    reminderPickerVisible,
    setReminderPickerVisible,
  ] = useState(false);
  const reminderLabel =
    getReminderLabel(reminder);
  // =========================
  // TYP NAWYKU
  // =========================
  const [habitType, setHabitType] =
    useState<HabitType>("boolean");
  // =========================
  // CEL
  // =========================
  const [targetValue, setTargetValue] =
    useState("");
  // =========================
  // JEDNOSTKA
  // =========================
  const [selectedUnit, setSelectedUnit] =
    useState<HabitUnit>(
      habitUnits.find(
        (unit) => unit.id === "g"
      ) ?? habitUnits[0]
    );
  const [
    unitPickerVisible,
    setUnitPickerVisible,
  ] = useState(false);
  // =========================
  // IKONA
  // =========================
  const [selectedIcon, setSelectedIcon] =
    useState<HabitIconName>("CircleCheck");
  const [
    iconPickerVisible,
    setIconPickerVisible,
  ] = useState(false);
  // =========================
  // KOLOR
  // =========================
  const [selectedColor, setSelectedColor] =
    useState<HabitColor>(
      habitColors.find(
        (color) => color.id === "purple"
      ) ?? habitColors[0]
    );
  const [
    colorPickerVisible,
    setColorPickerVisible,
  ] = useState(false);
  // =========================
  // WALIDACJA
  // =========================
  const canCreate =
    name.trim().length > 0 &&
    (habitType === "boolean" ||
      Number(targetValue) > 0);
  // =========================
  // TWORZENIE NAWYKU
  // =========================
  const createHabit = () => {
    if (!canCreate) {
      return;
    }
    const newHabit: Habit = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      category,
      type: habitType,
      targetValue:
        habitType === "quantity"
          ? Number(targetValue)
          : null,
      unit:
        habitType === "quantity"
          ? selectedUnit
          : null,
      frequency,
      timeOfDay,
      reminder,
      icon: selectedIcon,
      color: selectedColor,
      archived: false,
      archivedAt: null,
    };
    addHabit(newHabit);
    router.replace("/");
  };
  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* ========================= */}
        {/* GÓRNY PASEK */}
        {/* ========================= */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>
              ‹
            </Text>
          </Pressable>
          <Text style={styles.topTitle}>
            Nowy nawyk
          </Text>
          <View style={styles.topPlaceholder} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ========================= */}
          {/* INTRO */}
          {/* ========================= */}
          <View style={styles.intro}>
            <View
              style={[
                styles.mainIcon,
                {
                  backgroundColor:
                    selectedColor.light,
                },
              ]}
            >
              <HabitIcon
                name={selectedIcon}
                size={31}
                color={selectedColor.primary}
              />
            </View>
            <Text style={styles.title}>
              Stwórz nowy nawyk
            </Text>
            <Text style={styles.subtitle}>
              Zacznij od małego kroku, który chcesz
              regularnie powtarzać.
            </Text>
          </View>
          {/* ========================= */}
          {/* NAZWA */}
          {/* ========================= */}
          <Text style={styles.sectionLabel}>
            NAZWA
          </Text>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>
              Nazwa nawyku
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Np. Kreatyna"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={40}
            />
          </View>
          {/* ========================= */}
          {/* KATEGORIA */}
          {/* ========================= */}
          <Text style={styles.sectionLabel}>
            KATEGORIA
          </Text>
          <View style={styles.optionsRow}>
            {(
              [
                "Codzienne",
                "Zdrowie",
                "Rozwój",
              ] as HabitCategory[]
            ).map((item) => (
              <Pressable
                key={item}
                onPress={() =>
                  setCategory(item)
                }
                style={[
                  styles.optionChip,
                  category === item && {
                    backgroundColor:
                      selectedColor.primary,
                    borderColor:
                      selectedColor.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    category === item &&
                      styles.optionChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          {/* ========================= */}
          {/* TYP NAWYKU */}
          {/* ========================= */}
          <Text style={styles.sectionLabel}>
            TYP NAWYKU
          </Text>
          <View style={styles.habitTypeRow}>
            {/* TAK / NIE */}
            <Pressable
              onPress={() =>
                setHabitType("boolean")
              }
              style={[
                styles.habitTypeCard,
                habitType === "boolean" && {
                  backgroundColor:
                    selectedColor.primary,
                  borderColor:
                    selectedColor.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.habitTypeIcon,
                  habitType === "boolean" &&
                    styles.habitTypeIconActive,
                ]}
              >
                <Text
                  style={[
                    styles.habitTypeIconText,
                    habitType === "boolean" &&
                      styles.habitTypeTextActive,
                  ]}
                >
                  ✓
                </Text>
              </View>
              <Text
                style={[
                  styles.habitTypeTitle,
                  habitType === "boolean" &&
                    styles.habitTypeTextActive,
                ]}
              >
                Tak / Nie
              </Text>
              <Text
                style={[
                  styles.habitTypeSubtitle,
                  habitType === "boolean" &&
                    styles.habitTypeSubtitleActive,
                ]}
              >
                Wykonane lub niewykonane
              </Text>
            </Pressable>
            {/* ILOŚĆ */}
            <Pressable
              onPress={() =>
                setHabitType("quantity")
              }
              style={[
                styles.habitTypeCard,
                habitType === "quantity" && {
                  backgroundColor:
                    selectedColor.primary,
                  borderColor:
                    selectedColor.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.habitTypeIcon,
                  habitType === "quantity" &&
                    styles.habitTypeIconActive,
                ]}
              >
                <Text
                  style={[
                    styles.habitTypeIconText,
                    habitType === "quantity" &&
                      styles.habitTypeTextActive,
                  ]}
                >
                  #
                </Text>
              </View>
              <Text
                style={[
                  styles.habitTypeTitle,
                  habitType === "quantity" &&
                    styles.habitTypeTextActive,
                ]}
              >
                Ilość
              </Text>
              <Text
                style={[
                  styles.habitTypeSubtitle,
                  habitType === "quantity" &&
                    styles.habitTypeSubtitleActive,
                ]}
              >
                Mierz konkretną wartość
              </Text>
            </Pressable>
          </View>
          {/* ========================= */}
          {/* CEL */}
          {/* ========================= */}
          {habitType === "quantity" && (
            <>
              <Text style={styles.sectionLabel}>
                CEL
              </Text>
              <View style={styles.goalCard}>
                <View
                  style={styles.goalValueSection}
                >
                  <Text style={styles.goalLabel}>
                    Wartość celu
                  </Text>
                  <View
                    style={styles.goalInputRow}
                  >
                    <TextInput
                      value={targetValue}
                      onChangeText={(value) => {
                        const normalized =
                          value.replace(",", ".");
                        if (
                          normalized === "" ||
                          /^\d*\.?\d*$/.test(
                            normalized
                          )
                        ) {
                          setTargetValue(
                            normalized
                          );
                        }
                      }}
                      placeholder="20"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      style={styles.goalInput}
                    />
                    <Text
                      style={[
                        styles.goalUnitPreview,
                        {
                          color:
                            selectedColor.primary,
                        },
                      ]}
                    >
                      {selectedUnit.symbol}
                    </Text>
                  </View>
                </View>
                <View
                  style={styles.goalDivider}
                />
                <Pressable
                  style={styles.unitRow}
                  onPress={() =>
                    setUnitPickerVisible(true)
                  }
                >
                  <View>
                    <Text style={styles.goalLabel}>
                      Jednostka
                    </Text>
                    <Text
                      style={
                        styles.selectedUnitName
                      }
                    >
                      {selectedUnit.name}
                    </Text>
                  </View>
                  <View style={styles.unitRight}>
                    <View
                      style={[
                        styles.unitBadge,
                        {
                          backgroundColor:
                            selectedColor.light,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitBadgeText,
                          {
                            color:
                              selectedColor.dark,
                          },
                        ]}
                      >
                        {selectedUnit.symbol}
                      </Text>
                    </View>
                    <Text
                      style={styles.unitChevron}
                    >
                      ›
                    </Text>
                  </View>
                </Pressable>
              </View>
              {targetValue !== "" && (
                <View
                  style={[
                    styles.goalPreview,
                    {
                      backgroundColor:
                        selectedColor.light,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.goalPreviewLabel,
                      {
                        color:
                          selectedColor.dark,
                      },
                    ]}
                  >
                    TWÓJ CEL
                  </Text>
                  <Text
                    style={
                      styles.goalPreviewValue
                    }
                  >
                    {targetValue}{" "}
                    {selectedUnit.symbol}
                  </Text>
                  <Text
                    style={
                      styles.goalPreviewDescription
                    }
                  >
                    na zaplanowany dzień
                  </Text>
                </View>
              )}
            </>
          )}
          {/* ========================= */}
          {/* PLAN */}
          {/* ========================= */}
          <Text style={styles.sectionLabel}>
            PLAN
          </Text>
          <View style={styles.settingsCard}>
            {/* CZĘSTOTLIWOŚĆ */}
            <Pressable
              style={styles.settingRow}
              onPress={() =>
                setFrequencyPickerVisible(true)
              }
            >
              <View
                style={[
                  styles.settingIcon,
                  styles.purpleIcon,
                ]}
              >
                <Text
                  style={styles.settingIconText}
                >
                  ↻
                </Text>
              </View>
              <View style={styles.settingContent}>
                <Text
                  style={styles.settingTitle}
                >
                  Częstotliwość
                </Text>
                <Text
                  style={styles.settingValue}
                >
                  {frequencyLabel}
                </Text>
              </View>
              <Text style={styles.chevron}>
                ›
              </Text>
            </Pressable>
            <View style={styles.divider} />
            {/* PORA DNIA */}
            <Pressable
              style={styles.settingRow}
              onPress={() =>
                setTimeOfDayPickerVisible(true)
              }
            >
              <View
                style={[
                  styles.settingIcon,
                  styles.orangeIcon,
                ]}
              >
                <Text
                  style={styles.timeOfDayIcon}
                >
                  {timeOfDay.type === "morning"
                    ? "☀"
                    : timeOfDay.type ===
                        "afternoon"
                      ? "◐"
                      : timeOfDay.type ===
                          "evening"
                        ? "◒"
                        : timeOfDay.type ===
                            "night"
                          ? "☾"
                          : "○"}
                </Text>
              </View>
              <View style={styles.settingContent}>
                <Text
                  style={styles.settingTitle}
                >
                  Pora dnia
                </Text>
                <Text
                  style={styles.settingValue}
                >
                  {timeOfDayLabel}
                </Text>
              </View>
              <Text style={styles.chevron}>
                ›
              </Text>
            </Pressable>
            <View style={styles.divider} />
            {/* PRZYPOMNIENIE */}
            <Pressable
              style={styles.settingRow}
              onPress={() =>
                setReminderPickerVisible(true)
              }
            >
              <View
                style={[
                  styles.settingIcon,
                  styles.blueIcon,
                ]}
              >
                <Text
                  style={styles.reminderIcon}
                >
                  ♢
                </Text>
              </View>
              <View style={styles.settingContent}>
                <Text
                  style={styles.settingTitle}
                >
                  Przypomnienie
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    reminder.enabled &&
                      styles.reminderEnabledText,
                  ]}
                >
                  {reminderLabel}
                </Text>
              </View>
              {reminder.enabled && (
                <View
                  style={
                    styles.reminderActiveBadge
                  }
                >
                  <View
                    style={
                      styles.reminderActiveDot
                    }
                  />
                  <Text
                    style={
                      styles.reminderActiveText
                    }
                  >
                    ON
                  </Text>
                </View>
              )}
              <Text style={styles.chevron}>
                ›
              </Text>
            </Pressable>
          </View>
          {/* ========================= */}
          {/* WYGLĄD */}
          {/* ========================= */}
          <Text style={styles.sectionLabel}>
            WYGLĄD
          </Text>
          <View style={styles.settingsCard}>
            {/* IKONA */}
            <Pressable
              style={styles.settingRow}
              onPress={() =>
                setIconPickerVisible(true)
              }
            >
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor:
                      selectedColor.light,
                  },
                ]}
              >
                <HabitIcon
                  name={selectedIcon}
                  size={23}
                  color={selectedColor.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text
                  style={styles.settingTitle}
                >
                  Ikona
                </Text>
                <Text
                  style={styles.settingValue}
                >
                  {getHabitIconLabel(selectedIcon)}
                </Text>
              </View>
              <Text style={styles.chevron}>
                ›
              </Text>
            </Pressable>
            <View style={styles.divider} />
            {/* KOLOR */}
            <Pressable
              style={styles.settingRow}
              onPress={() =>
                setColorPickerVisible(true)
              }
            >
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor:
                      selectedColor.light,
                  },
                ]}
              >
                <View
                  style={[
                    styles.colorPreviewDot,
                    {
                      backgroundColor:
                        selectedColor.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.settingContent}>
                <Text
                  style={styles.settingTitle}
                >
                  Kolor
                </Text>
                <Text
                  style={styles.settingValue}
                >
                  {selectedColor.name}
                </Text>
              </View>
              <Text style={styles.chevron}>
                ›
              </Text>
            </Pressable>
          </View>
          {/* ========================= */}
          {/* PODGLĄD */}
          {/* ========================= */}
          <Text style={styles.sectionLabel}>
            PODGLĄD
          </Text>
          <View style={styles.habitPreview}>
            <View
              style={[
                styles.previewIcon,
                {
                  backgroundColor:
                    selectedColor.light,
                },
              ]}
            >
              <HabitIcon
                name={selectedIcon}
                size={25}
                color={selectedColor.primary}
              />
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewName}>
                {name.trim() || "Nazwa nawyku"}
              </Text>
              <Text
                style={styles.previewDetails}
              >
                {habitType === "quantity" &&
                targetValue
                  ? `${targetValue} ${selectedUnit.symbol} · ${frequencyLabel}`
                  : frequencyLabel}
              </Text>
              <View
                style={styles.previewMetaRow}
              >
                <Text
                  style={[
                    styles.previewMetaDot,
                    {
                      color:
                        selectedColor.primary,
                    },
                  ]}
                >
                  •
                </Text>
                <Text
                  style={styles.previewMetaText}
                >
                  {timeOfDayLabel}
                </Text>
                {reminder.enabled && (
                  <>
                    <Text
                      style={
                        styles.previewSeparator
                      }
                    >
                      ·
                    </Text>
                    <Text
                      style={
                        styles.previewReminderIcon
                      }
                    >
                      ♢
                    </Text>
                    <Text
                      style={
                        styles.previewMetaText
                      }
                    >
                      {reminderLabel}
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View
              style={[
                styles.previewCheck,
                {
                  borderColor:
                    selectedColor.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewCheckText,
                  {
                    color:
                      selectedColor.primary,
                  },
                ]}
              >
                ✓
              </Text>
            </View>
          </View>
          {/* ========================= */}
          {/* UTWÓRZ */}
          {/* ========================= */}
          <Pressable
            onPress={createHabit}
            style={[
              styles.createButton,
              canCreate
                ? {
                    backgroundColor:
                      selectedColor.primary,
                  }
                : styles.createButtonDisabled,
            ]}
            disabled={!canCreate}
          >
            <Text
              style={[
                styles.createButtonText,
                !canCreate &&
                  styles.createButtonTextDisabled,
              ]}
            >
              Utwórz nawyk
            </Text>
          </Pressable>
          <Text style={styles.footerText}>
            Ustawienia nawyku możesz później
            zmienić.
          </Text>
        </ScrollView>
      </SafeAreaView>
      {/* ========================= */}
      {/* FREQUENCY PICKER */}
      {/* ========================= */}
      <FrequencyPicker
        visible={frequencyPickerVisible}
        value={frequency}
        onSelect={(newFrequency) =>
          setFrequency(newFrequency)
        }
        onClose={() =>
          setFrequencyPickerVisible(false)
        }
      />
      {/* ========================= */}
      {/* TIME OF DAY PICKER */}
      {/* ========================= */}
      <TimeOfDayPicker
        visible={timeOfDayPickerVisible}
        value={timeOfDay}
        onSelect={(newTimeOfDay) =>
          setTimeOfDay(newTimeOfDay)
        }
        onClose={() =>
          setTimeOfDayPickerVisible(false)
        }
      />
      {/* ========================= */}
      {/* REMINDER PICKER */}
      {/* ========================= */}
      <ReminderPicker
        visible={reminderPickerVisible}
        value={reminder}
        onSelect={(newReminder) =>
          setReminder(newReminder)
        }
        onClose={() =>
          setReminderPickerVisible(false)
        }
      />
      {/* ========================= */}
      {/* UNIT PICKER */}
      {/* ========================= */}
      <UnitPicker
        visible={unitPickerVisible}
        selectedUnit={selectedUnit}
        onSelect={(unit) =>
          setSelectedUnit(unit)
        }
        onClose={() =>
          setUnitPickerVisible(false)
        }
      />
      {/* ========================= */}
      {/* ICON PICKER */}
      {/* ========================= */}
      <HabitIconPicker
        visible={iconPickerVisible}
        selectedIcon={selectedIcon}
        onSelect={(icon) =>
          setSelectedIcon(icon)
        }
        onClose={() =>
          setIconPickerVisible(false)
        }
      />
      {/* ========================= */}
      {/* COLOR PICKER */}
      {/* ========================= */}
      <ColorPicker
        visible={colorPickerVisible}
        selectedColor={selectedColor}
        onSelect={(color) =>
          setSelectedColor(color)
        }
        onClose={() =>
          setColorPickerVisible(false)
        }
      />
    </View>
  );
}
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
    justifyContent: "space-between",
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeIcon: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  topPlaceholder: {
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
    fontSize: 31,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 310,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
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
  optionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  optionChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  optionChipTextActive: {
    color: "#FFFFFF",
  },
  habitTypeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  habitTypeCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },
  habitTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  habitTypeIconActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  habitTypeIconText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
  },
  habitTypeTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  habitTypeSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  habitTypeTextActive: {
    color: "#FFFFFF",
  },
  habitTypeSubtitleActive: {
    color: colors.surface,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  goalValueSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  goalLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  goalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  goalInput: {
    flex: 1,
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  goalUnitPreview: {
    fontSize: 18,
    fontWeight: "700",
  },
  goalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  unitRow: {
    minHeight: 70,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedUnitName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 3,
  },
  unitRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unitBadge: {
    minWidth: 42,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unitBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  unitChevron: {
    color: colors.textMuted,
    fontSize: 28,
  },
  goalPreview: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
  },
  goalPreviewLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  goalPreviewValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 5,
  },
  goalPreviewDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 22,
  },
  settingRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  settingIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  purpleIcon: {
    backgroundColor: colors.accentSoft,
  },
  orangeIcon: {
    backgroundColor: colors.surfaceSecondary,
  },
  blueIcon: {
    backgroundColor: colors.accentSoft,
  },
  settingIconText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: "600",
  },
  timeOfDayIcon: {
    color: colors.accent,
    fontSize: 21,
    fontWeight: "600",
  },
  reminderIcon: {
    color: colors.accent,
    fontSize: 21,
    fontWeight: "700",
  },
  reminderEnabledText: {
    color: colors.accent,
    fontWeight: "600",
  },
  reminderActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 9,
    marginLeft: 6,
  },
  reminderActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 5,
  },
  reminderActiveText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "800",
  },
  selectedEmoji: {
    fontSize: 23,
  },
  colorPreviewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  settingValue: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 28,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 73,
  },
  habitPreview: {
    minHeight: 92,
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
  previewEmoji: {
    fontSize: 25,
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
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  previewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 3,
  },
  previewMetaDot: {
    fontSize: 13,
    fontWeight: "800",
    marginRight: 5,
  },
  previewMetaText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  previewSeparator: {
    color: colors.textMuted,
    fontSize: 11,
    marginHorizontal: 6,
  },
  previewReminderIcon: {
    color: colors.accent,
    fontSize: 11,
    marginRight: 4,
  },
  previewCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCheckText: {
    fontSize: 14,
    fontWeight: "700",
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