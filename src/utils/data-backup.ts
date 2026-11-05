import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { scopedStorageKey } from "../hooks/usePersistentList";

export const BACKUP_APP_ID = "habits-app";
export const BACKUP_VERSION = 1;

export const BACKUP_KEYS = {
  habits: "@habits/habits",
  habitEntries: "@habits/habit-entries",
  routines: "@habits/routines",
  routineEntries: "@habits/routine-entries",
} as const;

type BackupData = Record<keyof typeof BACKUP_KEYS, unknown[]>;

type BackupFile = {
  app: string;
  version: number;
  exportedAt: string;
  data: BackupData;
};

async function readList(key: string): Promise<unknown[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

// expo-file-system nie działa w przeglądarce - używamy Blob i <input type="file">.
function downloadOnWeb(fileName: string, content: string) {
  const doc = (globalThis as any).document;
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" })
  );
  const link = doc.createElement("a");
  link.href = url;
  link.download = fileName;
  doc.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pickTextOnWeb(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = (globalThis as any).document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      file.text().then(resolve, reject);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function exportBackup(uid: string) {
  const data = {} as BackupData;

  for (const name of Object.keys(BACKUP_KEYS) as (keyof BackupData)[]) {
    data[name] = await readList(scopedStorageKey(BACKUP_KEYS[name], uid));
  }

  const backup: BackupFile = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  const stamp = backup.exportedAt.slice(0, 10);

  if (Platform.OS === "web") {
    downloadOnWeb(`habits-backup-${stamp}.json`, JSON.stringify(backup, null, 2));
    return;
  }

  const file = new File(Paths.cache, `habits-backup-${stamp}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(backup, null, 2));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Udostępnianie plików nie jest dostępne na tym urządzeniu.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: "Zapisz kopię zapasową",
  });
}

export function parseBackup(text: string): BackupFile {
  let parsed: Partial<BackupFile>;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Plik nie jest poprawnym JSON-em.");
  }

  if (!parsed || parsed.app !== BACKUP_APP_ID || !parsed.data) {
    throw new Error("To nie jest kopia zapasowa tej aplikacji.");
  }

  if (typeof parsed.version !== "number" || parsed.version > BACKUP_VERSION) {
    throw new Error("Kopia pochodzi z nowszej wersji aplikacji.");
  }

  for (const name of Object.keys(BACKUP_KEYS) as (keyof BackupData)[]) {
    if (!Array.isArray(parsed.data[name])) {
      throw new Error(`Brak lub błędne dane: ${name}.`);
    }
  }

  return parsed as BackupFile;
}

export type PickedBackup = {
  backup: BackupFile;
  summary: { habits: number; routines: number; entries: number };
};

// null = użytkownik anulował wybór pliku.
export async function pickBackup(): Promise<PickedBackup | null> {
  let text: string | null;

  if (Platform.OS === "web") {
    text = await pickTextOnWeb();
  } else {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", "*/*"],
      copyToCacheDirectory: true,
    });
    text =
      result.canceled || !result.assets[0]
        ? null
        : await new File(result.assets[0].uri).text();
  }

  if (text === null) return null;

  const backup = parseBackup(text);

  return {
    backup,
    summary: {
      habits: backup.data.habits.length,
      routines: backup.data.routines.length,
      entries:
        backup.data.habitEntries.length + backup.data.routineEntries.length,
    },
  };
}

export async function applyBackup(backup: BackupFile, uid: string) {
  // Zachowaj obecne dane, by można je było odzyskać po pomyłce.
  const stamp = Date.now();
  for (const baseKey of Object.values(BACKUP_KEYS)) {
    const key = scopedStorageKey(baseKey, uid);
    const current = await AsyncStorage.getItem(key);
    if (current !== null) {
      await AsyncStorage.setItem(`${key}:before-import-${stamp}`, current);
    }
  }

  await AsyncStorage.multiSet(
    (Object.keys(BACKUP_KEYS) as (keyof BackupData)[]).map((name) => [
      scopedStorageKey(BACKUP_KEYS[name], uid),
      JSON.stringify(backup.data[name]),
    ])
  );
}
