import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredLoadResult =
  | { ok: true; value: unknown }
  | { ok: false };

const backupKey = (key: string) => `${key}:backup`;

function parseJson(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

// Zwraca ok=false, gdy nie da się bezpiecznie odczytać danych - wtedy nie wolno ich nadpisywać.
export async function loadStoredJson(key: string): Promise<StoredLoadResult> {
  let raw: string | null;

  try {
    raw = await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Błąd odczytu ${key}:`, error);
    return { ok: false };
  }

  if (raw === null) {
    return { ok: true, value: null };
  }

  const parsed = parseJson(raw);
  if (parsed.ok) {
    // Kopia ostatniego poprawnie wczytanego stanu.
    void AsyncStorage.setItem(backupKey(key), raw).catch(() => undefined);
    return parsed;
  }

  try {
    await AsyncStorage.setItem(`${key}:corrupt-${Date.now()}`, raw);
    const backup = await AsyncStorage.getItem(backupKey(key));
    const restored = backup === null ? null : parseJson(backup);

    if (restored?.ok) {
      return restored;
    }
  } catch (error) {
    console.error(`Błąd odzyskiwania ${key}:`, error);
  }

  return { ok: false };
}
