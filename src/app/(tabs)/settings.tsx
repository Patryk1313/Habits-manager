import { useState } from "react";
import { ChevronRight, Database, Palette, UserRound, X } from "lucide-react-native";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountSettings from "../../components/settings/AccountSettings";
import DataSettings from "../../components/settings/DataSettings";
import {
  accentColors,
  AppAccentColor,
  AppThemeMode,
  useTheme,
} from "../../context/ThemeContext";
// =========================
// OPCJE
// =========================
const themeOptions: {
  id: AppThemeMode;
  name: string;
  icon: string;
}[] = [
  {
    id: "dark",
    name: "Ciemny",
    icon: "☾",
  },
  {
    id: "light",
    name: "Jasny",
    icon: "☀",
  },
];
const accentOptions: AppAccentColor[] = [
  "auto",
  "purple",
  "blue",
  "green",
  "pink",
  "orange",
];

type SettingsSection = "account" | "appearance" | "data";

const settingsSections = [
  { id: "account", label: "Konto", description: "Twoje konto i wylogowanie", icon: UserRound },
  { id: "appearance", label: "Wygląd aplikacji", description: "Motyw i kolor akcentu", icon: Palette },
  { id: "data", label: "Twoje dane", description: "Kopia zapasowa i przywracanie danych", icon: Database },
] as const;
// =========================
// EKRAN
// =========================
export default function SettingsScreen() {
  const {
    mode,
    accent,
    colors,
    setMode,
    setAccent,
  } = useTheme();
  const isDark = mode === "dark";
  const [section, setSection] = useState<SettingsSection | null>(null);
  const sectionTitle = settingsSections.find((item) => item.id === section)?.label;
  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          colors.background
        }
      />
      <SafeAreaView
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ========================= */}
          {/* HEADER */}
          {/* ========================= */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Ustawienia
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Dostosuj aplikację do siebie
            </Text>
          </View>
          <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {settingsSections.map((item, index) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => setSection(item.id)}
                  activeOpacity={0.75}
                  style={[
                    styles.menuRow,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                  ]}
                >
                  <View style={[styles.menuIcon, { backgroundColor: colors.surfaceSecondary }]}>
                    <Icon size={20} color={colors.textSecondary} strokeWidth={2} />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.menuDescription, { color: colors.textMuted }]}>{item.description}</Text>
                  </View>
                  <View style={[styles.menuArrow, { backgroundColor: colors.surfaceSecondary }]}>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal
        visible={section !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSection(null)}
      >
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
          <View
            accessibilityViewIsModal
            style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text accessibilityRole="header" style={[styles.modalTitle, { color: colors.text }]}>
                {sectionTitle}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Zamknij ustawienia"
                onPress={() => setSection(null)}
                style={[styles.modalClose, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
          {section === "data" && <DataSettings />}
          {section === "account" && <AccountSettings />}

          {section === "appearance" && (
            <>
          {/* ========================= */}
          {/* MOTYW */}
          {/* ========================= */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              MOTYW
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Wygląd aplikacji
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Wybierz jasny lub ciemny
                wygląd interfejsu.
              </Text>
              <View
                style={
                  styles.themeOptions
                }
              >
                {themeOptions.map(
                  (option) => {
                    const selected =
                      mode === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.75}
                        onPress={() =>
                          setMode(
                            option.id
                          )
                        }
                        style={[
                          styles.themeOption,
                          {
                            backgroundColor:
                              selected
                                ? colors.accentSoft
                                : colors
                                    .surfaceSecondary,
                            borderColor:
                              selected
                                ? colors.accent
                                : colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.themeIcon,
                            {
                              backgroundColor:
                                selected
                                  ? colors.accent
                                  : colors
                                      .surface,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.themeIconText,
                              {
                                color:
                                  selected
                                    ? colors.accentForeground
                                    : colors
                                        .textSecondary,
                              },
                            ]}
                          >
                            {option.icon}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.themeName,
                            {
                              color:
                                selected
                                  ? colors.text
                                  : colors
                                      .textSecondary,
                            },
                          ]}
                        >
                          {option.name}
                        </Text>
                        <View
                          style={[
                            styles.radioOuter,
                            {
                              borderColor:
                                selected
                                  ? colors.accent
                                  : colors
                                      .textMuted,
                            },
                          ]}
                        >
                          {selected ? (
                            <View
                              style={[
                                styles.radioInner,
                                {
                                  backgroundColor:
                                    colors.accent,
                                },
                              ]}
                            />
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          </View>
          {/* ========================= */}
          {/* KOLOR AKCENTU */}
          {/* ========================= */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              KOLOR AKCENTU
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Główny kolor
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Ten kolor będzie używany
                w aktywnych elementach
                aplikacji.
              </Text>
              <View
                style={
                  styles.accentGrid
                }
              >
                {accentOptions.map(
                  (accentId) => {
                    const option =
                      accentId === "auto"
                        ? null
                        : accentColors[accentId];
                    const selected =
                      accent === accentId;
                    const optionPrimary =
                      option?.primary ??
                      (mode === "dark"
                        ? "#FFFFFF"
                        : "#000000");
                    const optionName =
                      option?.name ??
                      "Automatyczny";
                    const optionForeground =
                      accentId === "auto" &&
                      mode === "dark"
                        ? "#101014"
                        : "#FFFFFF";
                    return (
                      <TouchableOpacity
                        key={accentId}
                        activeOpacity={0.75}
                        onPress={() =>
                          setAccent(
                            accentId
                          )
                        }
                        style={[
                          styles.accentOption,
                          {
                            backgroundColor:
                              selected
                                ? colors
                                    .surfaceSecondary
                                : "transparent",
                            borderColor:
                              selected
                                ? optionPrimary
                                : colors.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.colorCircle,
                            {
                              backgroundColor:
                                optionPrimary,
                            },
                          ]}
                        >
                          {selected ? (
                            <Text
                              style={[
                                styles.check,
                                { color: optionForeground },
                              ]}
                            >
                              ✓
                            </Text>
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.accentName,
                            {
                              color:
                                selected
                                  ? colors.text
                                  : colors
                                      .textSecondary,
                            },
                          ]}
                        >
                          {optionName}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          </View>
          {/* ========================= */}
          {/* PODGLĄD */}
          {/* ========================= */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              PODGLĄD
            </Text>
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.previewIcon,
                  {
                    backgroundColor:
                      colors.accentSoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewEmoji,
                    { color: colors.accent },
                  ]}
                >
                  ✓
                </Text>
              </View>
              <View
                style={
                  styles.previewContent
                }
              >
                <Text
                  style={[
                    styles.previewTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Przykładowy nawyk
                </Text>
                <Text
                  style={[
                    styles.previewDescription,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Tak będzie wyglądał
                  wybrany akcent
                </Text>
              </View>
              <View
                style={[
                  styles.previewCheck,
                  {
                    backgroundColor:
                      colors.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewCheckText,
                    { color: colors.accentForeground },
                  ]}
                >
                  ✓
                </Text>
              </View>
            </View>
          </View>
          {/* ========================= */}
          {/* INFORMACJA */}
          {/* ========================= */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.infoTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Personalizacja
            </Text>
            <Text
              style={[
                styles.infoText,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Wybrane ustawienia są
              zapisywane automatycznie i
              pozostaną aktywne po
              ponownym uruchomieniu
              aplikacji.
            </Text>
          </View>
          {/* ========================= */}
          {/* FOOTER */}
          {/* ========================= */}
          <View style={styles.footer}>
            <View
              style={[
                styles.appIcon,
                {
                  backgroundColor:
                    colors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.appIconText,
                  { color: colors.accentForeground },
                ]}
              >
                H
              </Text>
            </View>
            <Text
              style={[
                styles.appName,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Habits
            </Text>
            <Text
              style={[
                styles.version,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Wersja 1.0.0
            </Text>
          </View>
            </>
          )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
// =========================
// STYLE
// =========================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 15, 20, 0.42)",
  },
  modalCard: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  menu: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    minHeight: 76,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    gap: 3,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  menuDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  menuArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  themeOptions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  themeOption: {
    flex: 1,
    minHeight: 118,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  themeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  themeIconText: {
    fontSize: 20,
    fontWeight: "700",
  },
  themeName: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
  },
  radioOuter: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  accentOption: {
    width: "48%",
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  check: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  accentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  previewCard: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  previewIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  previewEmoji: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  previewDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  previewCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCheckText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  footer: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  appIconText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  appName: {
    fontSize: 14,
    fontWeight: "700",
  },
  version: {
    fontSize: 11,
    marginTop: 3,
  },
});