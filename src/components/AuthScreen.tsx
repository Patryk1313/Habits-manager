import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

type Mode = "signIn" | "signUp";

export default function AuthScreen() {
  const { colors } = useTheme();
  const { isConfigured, signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSignUp = mode === "signUp";

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coś poszło nie tak.");
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      if (!email.trim() || !password) {
        throw new Error("Wpisz e-mail i hasło.");
      }
      if (isSignUp) {
        if (password !== confirm) {
          throw new Error("Hasła nie są takie same.");
        }
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    });

  const reset = () =>
    run(async () => {
      if (!email.trim()) {
        throw new Error("Wpisz e-mail, na który wysłać link.");
      }
      await resetPassword(email);
      setInfo("Wysłaliśmy link do zmiany hasła na podany adres.");
    });

  const input = [
    styles.input,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.safe}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.title, { color: colors.text }]}>Habits</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isSignUp ? "Załóż konto" : "Zaloguj się, aby kontynuować"}
            </Text>

            {!isConfigured ? (
              <Text style={[styles.error, { color: colors.danger }]}>
                Brak konfiguracji Firebase. Uzupełnij plik .env (patrz
                .env.example) i zbuduj aplikację ponownie.
              </Text>
            ) : (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-mail"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={input}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Hasło"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  onSubmitEditing={isSignUp ? undefined : submit}
                  style={input}
                />
                {isSignUp && (
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Powtórz hasło"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onSubmitEditing={submit}
                    style={input}
                  />
                )}

                {error && (
                  <Text style={[styles.error, { color: colors.danger }]}>
                    {error}
                  </Text>
                )}
                {info && (
                  <Text style={[styles.error, { color: colors.success }]}>
                    {info}
                  </Text>
                )}

                <TouchableOpacity
                  disabled={busy}
                  onPress={submit}
                  style={[styles.button, { backgroundColor: colors.accent }]}
                >
                  {busy ? (
                    <ActivityIndicator color={colors.accentForeground} />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        { color: colors.accentForeground },
                      ]}
                    >
                      {isSignUp ? "Załóż konto" : "Zaloguj się"}
                    </Text>
                  )}
                </TouchableOpacity>

                {!isSignUp && (
                  <TouchableOpacity disabled={busy} onPress={reset}>
                    <Text style={[styles.link, { color: colors.textSecondary }]}>
                      Nie pamiętam hasła
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  disabled={busy}
                  onPress={() => {
                    setMode(isSignUp ? "signIn" : "signUp");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  <Text style={[styles.link, { color: colors.accent }]}>
                    {isSignUp
                      ? "Masz już konto? Zaloguj się"
                      : "Nie masz konta? Zarejestruj się"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  title: { fontSize: 34, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 28 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { fontSize: 14, marginBottom: 12 },
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  link: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 18,
  },
});
