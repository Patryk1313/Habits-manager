import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AccountSettings() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  const confirmSignOut = () =>
    Alert.alert(
      "Wylogować się?",
      "Twoje dane są zapisane w chmurze i wrócą po ponownym zalogowaniu.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Wyloguj",
          style: "destructive",
          onPress: () => void signOut(),
        },
      ]
    );

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
        <TouchableOpacity
          onPress={confirmSignOut}
          style={[styles.button, { borderColor: colors.danger }]}
        >
          <Text style={[styles.buttonText, { color: colors.danger }]}>
            Wyloguj się
          </Text>
        </TouchableOpacity>
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
  buttonText: { fontSize: 15, fontWeight: "700" },
});
