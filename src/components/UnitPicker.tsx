import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  HabitUnit,
  habitUnits,
} from "../constants/habit-units";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";

type Props = {
  visible: boolean;
  selectedUnit?: HabitUnit | null;
  onSelect: (unit: HabitUnit) => void;
  onClose: () => void;
};

export default function UnitPicker({
  visible,
  selectedUnit,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [search, setSearch] = useState("");
  const [showCustomUnit, setShowCustomUnit] = useState(false);

  const [customName, setCustomName] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return habitUnits;
    }

    return habitUnits.filter((unit) => {
      return (
        unit.name.toLowerCase().includes(query) ||
        unit.symbol.toLowerCase().includes(query) ||
        unit.category.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(filteredUnits.map((unit) => unit.category))
    );
  }, [filteredUnits]);

  const selectUnit = (unit: HabitUnit) => {
    onSelect(unit);

    setSearch("");
    onClose();
  };

  const createCustomUnit = () => {
    if (!customName.trim() || !customSymbol.trim()) {
      return;
    }

    const customUnit: HabitUnit = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      symbol: customSymbol.trim(),
      category: "Inne",
    };

    onSelect(customUnit);

    setCustomName("");
    setCustomSymbol("");
    setShowCustomUnit(false);
    setSearch("");

    onClose();
  };

  const closePicker = () => {
    setSearch("");
    setShowCustomUnit(false);
    setCustomName("");
    setCustomSymbol("");

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closePicker}
    >
      <View style={styles.modal}>
        <Pressable
          style={styles.backdrop}
          onPress={closePicker}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                Wybierz jednostkę
              </Text>

              <Text style={styles.subtitle}>
                Jak chcesz mierzyć ten nawyk?
              </Text>
            </View>

            <Pressable
              onPress={closePicker}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          {!showCustomUnit ? (
            <>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Szukaj jednostki..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  autoCorrect={false}
                />

                {search.length > 0 && (
                  <Pressable
                    onPress={() => setSearch("")}
                    hitSlop={10}
                  >
                    <Text style={styles.clearSearch}>×</Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.unitsContent}
                keyboardShouldPersistTaps="handled"
              >
                {categories.map((category) => {
                  const units = filteredUnits.filter(
                    (unit) => unit.category === category
                  );

                  return (
                    <View
                      key={category}
                      style={styles.category}
                    >
                      <Text style={styles.categoryTitle}>
                        {category.toUpperCase()}
                      </Text>

                      <View style={styles.categoryCard}>
                        {units.map((unit, index) => {
                          const selected =
                            selectedUnit?.id === unit.id;

                          return (
                            <View key={unit.id}>
                              <Pressable
                                onPress={() => selectUnit(unit)}
                                style={styles.unitRow}
                              >
                                <View style={styles.unitSymbol}>
                                  <Text
                                    style={styles.unitSymbolText}
                                    numberOfLines={1}
                                  >
                                    {unit.symbol}
                                  </Text>
                                </View>

                                <View style={styles.unitInfo}>
                                  <Text style={styles.unitName}>
                                    {unit.name}
                                  </Text>

                                  <Text
                                    style={styles.unitDescription}
                                  >
                                    {unit.symbol}
                                  </Text>
                                </View>

                                {selected ? (
                                  <View
                                    style={styles.selectedCircle}
                                  >
                                    <Text
                                      style={styles.selectedCheck}
                                    >
                                      ✓
                                    </Text>
                                  </View>
                                ) : (
                                  <View
                                    style={styles.unselectedCircle}
                                  />
                                )}
                              </Pressable>

                              {index < units.length - 1 && (
                                <View style={styles.divider} />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}

                {filteredUnits.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>
                      Nie znaleziono jednostki
                    </Text>

                    <Text style={styles.emptySubtitle}>
                      Możesz utworzyć własną jednostkę.
                    </Text>
                  </View>
                )}

                <Pressable
                  style={styles.customButton}
                  onPress={() => setShowCustomUnit(true)}
                >
                  <View style={styles.customIcon}>
                    <Text style={styles.customIconText}>
                      +
                    </Text>
                  </View>

                  <View style={styles.customContent}>
                    <Text style={styles.customTitle}>
                      Dodaj własną jednostkę
                    </Text>

                    <Text style={styles.customSubtitle}>
                      Np. porcje, kapsułki, kubki
                    </Text>
                  </View>

                  <Text style={styles.customChevron}>
                    ›
                  </Text>
                </Pressable>

                <View style={styles.bottomSpace} />
              </ScrollView>
            </>
          ) : (
            <ScrollView
              style={styles.customFormScroll}
              contentContainerStyle={styles.customForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                onPress={() => setShowCustomUnit(false)}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>
                  ‹ Wróć do jednostek
                </Text>
              </Pressable>

              <Text style={styles.customFormTitle}>
                Własna jednostka
              </Text>

              <Text style={styles.customFormSubtitle}>
                Utwórz jednostkę dopasowaną do swojego nawyku.
              </Text>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>
                  Nazwa
                </Text>

                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Np. Kapsułki"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  maxLength={30}
                />
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>
                  Skrót / symbol
                </Text>

                <TextInput
                  value={customSymbol}
                  onChangeText={setCustomSymbol}
                  placeholder="Np. kaps."
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  maxLength={10}
                />
              </View>

              <View style={styles.preview}>
                <Text style={styles.previewLabel}>
                  PODGLĄD
                </Text>

                <Text style={styles.previewValue}>
                  20 {customSymbol || "jedn."}
                </Text>
              </View>

              <Pressable
                onPress={createCustomUnit}
                disabled={
                  !customName.trim() ||
                  !customSymbol.trim()
                }
                style={[
                  styles.saveButton,
                  (!customName.trim() ||
                    !customSymbol.trim()) &&
                    styles.saveButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    (!customName.trim() ||
                      !customSymbol.trim()) &&
                      styles.saveButtonTextDisabled,
                  ]}
                >
                  Dodaj jednostkę
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
    height: "86%",
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
    marginBottom: 18,
  },

  headerText: {
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
    marginLeft: 12,
  },

  closeText: {
    color: colors.textSecondary,
    fontSize: 25,
    lineHeight: 27,
  },

  searchBox: {
    height: 50,
    marginHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  searchIcon: {
    color: colors.textMuted,
    fontSize: 21,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  clearSearch: {
    color: colors.textMuted,
    fontSize: 22,
    paddingHorizontal: 4,
  },

  unitsContent: {
    paddingHorizontal: 18,
  },

  category: {
    marginBottom: 20,
  },

  categoryTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 5,
    marginBottom: 8,
  },

  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  unitRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  unitSymbol: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    paddingHorizontal: 4,
  },

  unitSymbolText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },

  unitInfo: {
    flex: 1,
  },

  unitName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },

  unitDescription: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  selectedCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedCheck: {
    color: colors.accentForeground,
    fontSize: 14,
    fontWeight: "700",
  },

  unselectedCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 69,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 5,
  },

  customButton: {
    minHeight: 74,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  customIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  customIconText: {
    color: colors.accent,
    fontSize: 26,
  },

  customContent: {
    flex: 1,
  },

  customTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },

  customSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },

  customChevron: {
    color: colors.textMuted,
    fontSize: 28,
  },

  bottomSpace: {
    height: 35,
  },

  customFormScroll: {
    flex: 1,
  },

  customForm: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 22,
  },

  backButtonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },

  customFormTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },

  customFormSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },

  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 12,
  },

  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },

  input: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    paddingHorizontal: 0,
    paddingVertical: 8,
  },

  preview: {
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    padding: 17,
    marginTop: 8,
    marginBottom: 20,
  },

  previewLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  previewValue: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "700",
    marginTop: 6,
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
    fontSize: 16,
    fontWeight: "700",
  },

  saveButtonTextDisabled: {
    color: colors.textMuted,
  },
  });
}