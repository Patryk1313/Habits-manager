import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { loadStoredJson } from "../utils/storage";

// `normalize` musi być stałą funkcją (poza komponentem).
export function usePersistentList<T>(
  storageKey: string,
  normalize: (items: unknown[]) => T[]
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

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
    applyResult(await loadStoredJson(storageKey));
  }, [storageKey, applyResult]);

  useEffect(() => {
    let cancelled = false;

    loadStoredJson(storageKey).then((result) => {
      if (cancelled) return;
      applyResult(result);
    });

    return () => {
      cancelled = true;
    };
  }, [storageKey, applyResult]);

  useEffect(() => {
    // Nigdy nie zapisujemy, jeśli odczyt się nie udał - mogłoby to skasować dane.
    if (isLoading || loadFailed) {
      return;
    }

    AsyncStorage.setItem(storageKey, JSON.stringify(items)).catch(
      (error) => console.error(`Błąd zapisu ${storageKey}:`, error)
    );
  }, [items, isLoading, loadFailed, storageKey]);

  return { items, setItems, isLoading, loadFailed, reload };
}
