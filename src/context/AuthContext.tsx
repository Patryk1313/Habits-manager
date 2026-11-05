import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";

import { auth, isFirebaseConfigured } from "../config/firebase";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Nieprawidłowy adres e-mail.",
  "auth/missing-password": "Wpisz hasło.",
  "auth/invalid-credential": "Nieprawidłowy e-mail lub hasło.",
  "auth/user-not-found": "Nieprawidłowy e-mail lub hasło.",
  "auth/wrong-password": "Nieprawidłowy e-mail lub hasło.",
  "auth/email-already-in-use": "Konto z tym adresem e-mail już istnieje.",
  "auth/weak-password": "Hasło jest za słabe (minimum 6 znaków).",
  "auth/too-many-requests": "Zbyt wiele prób. Spróbuj ponownie za chwilę.",
  "auth/network-request-failed": "Brak połączenia z internetem.",
  "auth/operation-not-allowed":
    "Logowanie e-mailem nie jest włączone w Firebase.",
};

function toMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return ERROR_MESSAGES[code] ?? "Coś poszło nie tak. Spróbuj ponownie.";
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (error) {
      throw new Error(toMessage(error));
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isConfigured: isFirebaseConfigured,
      signIn: (email, password) =>
        run(() =>
          signInWithEmailAndPassword(auth!, email.trim(), password)
        ),
      signUp: (email, password) =>
        run(() =>
          createUserWithEmailAndPassword(auth!, email.trim(), password)
        ),
      resetPassword: (email) =>
        run(() => sendPasswordResetEmail(auth!, email.trim())),
      signOut: () => run(() => firebaseSignOut(auth!)),
    }),
    [user, isLoading, run]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth musi być użyty wewnątrz AuthProvider");
  }
  return context;
}
