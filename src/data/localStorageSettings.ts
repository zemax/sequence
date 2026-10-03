import { SOUND_LEVEL_COUNT, Settings, initialSettings } from "./settings/settingsSlice";

const STORAGE_KEY = "sequence.settings";

export const loadSettings = (): Settings | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return undefined;
    }

    // Values saved by an older version may lack newer fields, or hold something out of range.
    const { soundMuted, soundLevel } = parsed;
    return {
      soundMuted: typeof soundMuted === "boolean" ? soundMuted : initialSettings.soundMuted,
      soundLevel: Number.isInteger(soundLevel) && soundLevel >= 1 && soundLevel <= SOUND_LEVEL_COUNT ? soundLevel : initialSettings.soundLevel,
    };
  } catch {
    return undefined;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private browsing quota, etc.) — the app still works, just unpersisted.
  }
};
