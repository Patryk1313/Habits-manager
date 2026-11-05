import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { loadStoredJson } from "../utils/storage";

// Lokalny cache jest osobny dla każdego użytkownika.
export function scopedStorageKey(storageKey: string, uid: string) {
  return `${storageKey}:${uid}`;
}

// Do dokumentu Firestore (limit 1 MB) trafia jedna lista zapisana jako JSON.
function listDoc(uid: string, storageKey: string) {
  const name = storageKey.replace(/[^a-zA-Z0-9-]/g, "_");
  return doc(db!, "users", uid, "lists", name);
}

// `normalize` musi być stałą funkcją (poza komponentem).
export function usePersistentList<T>(
  storageKey: string,
  normalize: (items: unknown[]) => T[]
) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const localKey = uid ? scopedStorageKey(storageKey, uid) : storageKey;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const lastSyncedRef = useRef<string | null>(null);

  const applyResult = useCallback(
    (result: Awaited<ReturnType<typeof loadStoredJson>>) => {
    if (
      result.ok &&
      (result.value === null || Array.isArray(result.value))
    ) {
      setItems(normalize((result.value as unknown[] | null) ?? []));
      setLoadFailed(false);
    } else {
      setLoadFailed(true);
    }

    setIsLoading(false);
    },
    [normalize]
  );

  const reload = useCallback(async () => {
    applyResult(await loadStoredJson(localKey));
  }, [localKey, applyResult]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let result = await loadStoredJson(localKey);

      // Dane sprzed wprowadzenia kont: przejmuje je pierwsze konto na urządzeniu.
      if (uid && result.ok && result.value === null) {
        const legacy = await loadStoredJson(storageKey);
        if (legacy.ok && Array.isArray(legacy.value)) {
          const raw = JSON.stringify(legacy.value);
          await AsyncStorage.setItem(localKey, raw);
          await AsyncStorage.setItem(`${storageKey}:migrated-legacy`, raw);
          await AsyncStorage.removeItem(storageKey);
          result = legacy;
        }
      }

      if (!cancelled) applyResult(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [localKey, uid, storageKey, applyResult]);

  useEffect(() => {
    // Nigdy nie zapisujemy, jeśli odczyt się nie udał - mogłoby to skasować dane.
    if (isLoading || loadFailed) {
      return;
    }

    AsyncStorage.setItem(localKey, JSON.stringify(items)).catch(
      (error) => console.error(`Błąd zapisu ${localKey}:`, error)
    );
  }, [items, isLoading, loadFailed, localKey]);

  // Subskrypcja zdalnej kopii: pierwszy odczyt z serwera decyduje, czy dane
  // lokalne wolno wysłać (inaczej puste urządzenie skasowałoby konto).
  useEffect(() => {
    if (!uid || !db || isLoading || loadFailed) {
      return;
    }

    let first = true;

    return onSnapshot(
      listDoc(uid, storageKey),
      (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;

        if (!snapshot.exists()) {
          // Brak dokumentu w cache offline nie oznacza, że nie ma go na serwerze.
          if (snapshot.metadata.fromCache) return;
          if (first) {
            first = false;
            setRemoteReady(true);
          }
          return;
        }

        const json = snapshot.data().items as string;
        first = false;

        if (json !== lastSyncedRef.current) {
          try {
            const parsed = JSON.parse(json);
            if (Array.isArray(parsed)) {
              lastSyncedRef.current = json;
              setItems(normalize(parsed));
            }
          } catch (error) {
            console.error(`Uszkodzone dane zdalne ${storageKey}:`, error);
            return;
          }
        }

        setRemoteReady(true);
      },
      (error) => console.error(`Błąd synchronizacji ${storageKey}:`, error)
    );
  }, [uid, storageKey, isLoading, loadFailed, normalize]);

  useEffect(() => {
    if (!uid || !db || !remoteReady || isLoading || loadFailed) {
      return;
    }

    const json = JSON.stringify(items);
    if (json === lastSyncedRef.current) return;

    lastSyncedRef.current = json;
    setDoc(listDoc(uid, storageKey), {
      items: json,
      updatedAt: new Date().toISOString(),
    }).catch((error) => {
      lastSyncedRef.current = null;
      console.error(`Błąd zapisu w chmurze ${storageKey}:`, error);
    });
  }, [items, uid, storageKey, remoteReady, isLoading, loadFailed]);

  return { items, setItems, isLoading, loadFailed, reload };
}
