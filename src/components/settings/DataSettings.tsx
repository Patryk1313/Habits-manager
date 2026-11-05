import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useHabitEntries } from "../../context/HabitEntriesContext";
import { useHabits } from "../../context/HabitsContext";
import { useRoutineEntries } from "../../context/RoutineEntriesContext";
import { useRoutines } from "../../context/RoutinesContext";
import { useTheme } from "../../context/ThemeContext";
import { applyBackup, exportBackup, pickBackup } from "../../utils/data-backup";

// Alert.alert nie działa w przeglądarce.
function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    globalThis.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function confirmAction(title: string, message: string, confirmLabel: string) {
  if (Platform.OS === "web") {
    return Promise.resolve(globalThis.confirm(`${title}\n\n${message}`));
  }

  return new Promise<boolean>((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: "Anuluj", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    )
  );
}

export default function DataSettings() {
  const { colors } = useTheme();
  const habits = useHabits();
  const habitEntries = useHabitEntries();
  const routines = useRoutines();
  const routineEntries = useRoutineEntries();
  const [busy, setBusy] = useState(false);

  const loadFailed =
    habits.loadFailed ||
    habitEntries.loadFailed ||
    routines.loadFailed ||
    routineEntries.loadFailed;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      notify(
        "Coś poszło nie tak",
        error instanceof Error ? error.message : "Nieznany błąd."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleImport = () =>
    run(async () => {
      const picked = await pickBackup();
      if (!picked) return;

      const { summary, backup } = picked;
      const confirmed = await confirmAction(
        "Zaimportować dane?",
        `Plik zawiera: nawyki ${summary.habits}, rutyny ${summary.routines}, wpisy ${summary.entries}.\n\nObecne dane zostaną zastąpione.`,
        "Zastąp"
      );
      if (!confirmed) return;

      await applyBackup(backup);
      await Promise.all([
        habits.reload(),
        habitEntries.reload(),
        routines.reload(),
        routineEntries.reload(),
      ]);
      notify("Gotowe", "Dane zostały zaimportowane.");
    });

  const card = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  return (
    <View>
      {loadFailed && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.danger },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.danger }]}>
            Nie udało się wczytać danych
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Aplikacja nie nadpisuje uszkodzonych danych. Uszkodzona kopia została
            zachowana w pamięci — możesz przywrócić dane z pliku poniżej.
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        KOPIA ZAPASOWA
      </Text>

      <View style={[styles.card, card]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Eksport</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Zapisz nawyki, rutyny i całą historię do pliku JSON.
        </Text>
        <TouchableOpacity
          disabled={busy}
          onPress={() => run(exportBackup)}
          style={[styles.button, { backgroundColor: colors.accent }]}
        >
          <Text style={[styles.buttonText, { color: colors.accentForeground }]}>
            Eksportuj dane
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, card]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Import</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Wczytaj dane z pliku kopii zapasowej. Obecne dane zostaną zastąpione.
        </Text>
        <TouchableOpacity
          disabled={busy}
          onPress={handleImport}
          style={[
            styles.button,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Importuj dane
          </Text>
        </TouchableOpacity>
      </View>

      {busy && <ActivityIndicator color={colors.accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  description: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  button: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "700" },
});
