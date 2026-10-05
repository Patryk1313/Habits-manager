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

import HabitIcon from "../components/HabitIcon";
import { getFrequencyLabel } from "../components/FrequencyPicker";

import { useHabits } from "../context/HabitsContext";
import {
  AppThemeColors,
  useTheme,
} from "../context/ThemeContext";

// =========================
// EKRAN ARCHIWUM
// =========================

export default function ArchiveScreen() {
  const router = useRouter();
  const { mode, colors } = useTheme();
  const styles = createStyles(colors);

  // =========================
  // CONTEXT
  // =========================

  const {
    habits,
    restoreHabit,
    isLoading,
  } = useHabits();

  // =========================
  // ZARCHIWIZOWANE NAWYKI
  // =========================

  const archivedHabits = habits.filter(
    (habit) => habit.archived
  );

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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Wczytywanie archiwum...
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
        barStyle={
          mode === "dark"
            ? "light-content"
            : "dark-content"
        }
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
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.backButton,
              pressed && {
                opacity: 0.6,
              },
            ]}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Archiwum
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* ========================= */}
        {/* CONTENT */}
        {/* ========================= */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* ========================= */}
          {/* INTRO */}
          {/* ========================= */}

          <View style={styles.intro}>
            <View style={styles.archiveIcon}>
              <Text style={styles.archiveIconText}>
                ◫
              </Text>
            </View>

            <Text style={styles.title}>
              Zarchiwizowane nawyki
            </Text>

            <Text style={styles.subtitle}>
              Archiwizacja ukrywa nawyk z codziennej
              listy, ale zachowuje jego historię
              i statystyki.
            </Text>
          </View>

          {/* ========================= */}
          {/* LICZNIK */}
          {/* ========================= */}

          {archivedHabits.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                ARCHIWUM
              </Text>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {archivedHabits.length}
                </Text>
              </View>
            </View>
          )}

          {/* ========================= */}
          {/* PUSTE ARCHIWUM */}
          {/* ========================= */}

          {archivedHabits.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ✓
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                Archiwum jest puste
              </Text>

              <Text style={styles.emptyText}>
                Gdy zarchiwizujesz nawyk, pojawi się
                właśnie tutaj.
              </Text>

              <Pressable
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/");
                  }
                }}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && {
                    opacity: 0.75,
                  },
                ]}
              >
                <Text style={styles.emptyButtonText}>
                  Wróć do nawyków
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.list}>
              {archivedHabits.map((habit) => {
                return (
                  <View
                    key={habit.id}
                    style={styles.habitCard}
                  >
                    {/* ===================== */}
                    {/* GÓRNA CZĘŚĆ */}
                    {/* ===================== */}

                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/habit/[id]",
                          params: {
                            id: habit.id,
                          },
                        })
                      }
                      style={({ pressed }) => [
                        styles.habitMain,
                        pressed && {
                          opacity: 0.65,
                        },
                      ]}
                    >
                      {/* IKONA */}

                      <View
                        style={[
                          styles.habitIcon,
                          {
                            backgroundColor:
                              habit.color.light,
                          },
                        ]}
                      >
                        <HabitIcon
                          name={habit.icon}
                          size={25}
                          color={habit.color.primary}
                        />
                      </View>

                      {/* INFORMACJE */}

                      <View style={styles.habitContent}>
                        <Text
                          style={styles.habitName}
                          numberOfLines={1}
                        >
                          {habit.name}
                        </Text>

                        <Text
                          style={styles.habitDetails}
                          numberOfLines={1}
                        >
                          {habit.category}
                          {"  ·  "}
                          {getFrequencyLabel(
                            habit.frequency
                          )}
                        </Text>

                        {habit.type === "quantity" &&
                          habit.targetValue !== null &&
                          habit.unit && (
                            <Text
                              style={[
                                styles.targetText,
                                {
                                  color:
                                    habit.color.primary,
                                },
                              ]}
                            >
                              Cel: {habit.targetValue}{" "}
                              {habit.unit.symbol}
                            </Text>
                          )}
                      </View>

                      <Text style={styles.chevron}>
                        ›
                      </Text>
                    </Pressable>

                    {/* ===================== */}
                    {/* SEPARATOR */}
                    {/* ===================== */}

                    <View style={styles.separator} />

                    {/* ===================== */}
                    {/* PRZYWRÓĆ */}
                    {/* ===================== */}

                    <Pressable
                      onPress={() =>
                        restoreHabit(habit.id)
                      }
                      style={({ pressed }) => [
                        styles.restoreButton,
                        pressed && {
                          opacity: 0.6,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.restoreIcon,
                          {
                            backgroundColor:
                              habit.color.light,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.restoreIconText,
                            {
                              color:
                                habit.color.primary,
                            },
                          ]}
                        >
                          ↻
                        </Text>
                      </View>

                      <View style={styles.restoreContent}>
                        <Text
                          style={[
                            styles.restoreTitle,
                            {
                              color:
                                habit.color.primary,
                            },
                          ]}
                        >
                          Przywróć nawyk
                        </Text>

                        <Text
                          style={styles.restoreSubtitle}
                        >
                          Ponownie pokaż na aktywnej liście
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.restoreArrow,
                          {
                            color:
                              habit.color.primary,
                          },
                        ]}
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpace} />
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

  // =====================
  // HEADER
  // =====================

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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

  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  headerSpacer: {
    width: 42,
  },

  // =====================
  // CONTENT
  // =====================

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  // =====================
  // INTRO
  // =====================

  intro: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },

  archiveIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  archiveIconText: {
    color: colors.accent,
    fontSize: 31,
    fontWeight: "700",
  },

  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 8,
  },

  // =====================
  // SUMMARY
  // =====================

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  summaryLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  countBadge: {
    minWidth: 28,
    height: 25,
    borderRadius: 9,
    paddingHorizontal: 8,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
  },

  // =====================
  // LIST
  // =====================

  list: {
    gap: 12,
  },

  habitCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  habitMain: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  habitIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  habitIconText: {
    fontSize: 25,
  },

  habitContent: {
    flex: 1,
  },

  habitName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  habitDetails: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  targetText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },

  chevron: {
    color: colors.textMuted,
    fontSize: 27,
    marginLeft: 8,
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 79,
  },

  // =====================
  // RESTORE
  // =====================

  restoreButton: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  restoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  restoreIconText: {
    fontSize: 18,
    fontWeight: "800",
  },

  restoreContent: {
    flex: 1,
  },

  restoreTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  restoreSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },

  restoreArrow: {
    fontSize: 22,
    fontWeight: "500",
  },

  // =====================
  // EMPTY
  // =====================

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "800",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 270,
    marginTop: 7,
  },

  emptyButton: {
    minHeight: 45,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  emptyButtonText: {
    color: colors.accentForeground,
    fontSize: 13,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 30,
  },

  // =====================
  // LOADING
  // =====================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  });
}