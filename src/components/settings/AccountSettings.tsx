import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AccountSettings() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Nie udało się wylogować."
      );
      setBusy(false);
      return;
    }
    setBusy(false);
    setConfirming(false);
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        KONTO
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Zalogowano jako
        </Text>
        <Text style={[styles.email, { color: colors.text }]}>
          {user?.email}
        </Text>
        {error && (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        )}
        {confirming ? (
          <View style={styles.confirmation}>
            <Text style={[styles.confirmationText, { color: colors.textSecondary }]}>
              Twoje dane są zapisane w chmurze i wrócą po ponownym zalogowaniu.
            </Text>
            <TouchableOpacity
              disabled={busy}
              onPress={() => void confirmSignOut()}
              style={[styles.button, { backgroundColor: colors.danger }]}
            >
              {busy ? (
                <ActivityIndicator color={colors.accentForeground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.accentForeground }]}>
                  Potwierdź wylogowanie
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={busy}
              onPress={() => setConfirming(false)}
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Anuluj
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            disabled={busy}
            onPress={() => setConfirming(true)}
            style={[styles.button, { borderColor: colors.danger }]}
          >
            <Text style={[styles.buttonText, { color: colors.danger }]}>
              Wyloguj się
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  label: { fontSize: 12, marginBottom: 4 },
  email: { fontSize: 16, fontWeight: "600", marginBottom: 14 },
  button: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmation: { gap: 10 },
  confirmationText: { fontSize: 13, lineHeight: 19, marginBottom: 2 },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  error: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  buttonText: { fontSize: 15, fontWeight: "700" },
});
