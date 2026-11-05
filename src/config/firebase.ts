import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Zmienne EXPO_PUBLIC_* trafiają do paczki i są publiczne z założenia -
// dostęp do danych chronią reguły w firestore.rules, nie ukrywanie klucza.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

function createAuth(): Auth | null {
  if (!app) return null;
  if (Platform.OS === "web") return getAuth(app);

  try {
    // Eksport dostępny tylko w buildzie natywnym, stąd brak typów w importach.
    const { getReactNativePersistence } = require("firebase/auth");
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
// Auto-wykrywanie long pollingu: na części sieci mobilnych WebSocket jest blokowany,
// przez co zmiany nie dochodziłyby na żywo.
function createDb() {
  if (!app) return null;
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createDb();
