import { Sequence } from "./sequences/sequencesSlice";

const STORAGE_KEY = "sequence.sequences";

export const loadSequences = (): Sequence[] | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const saveSequences = (sequences: Sequence[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sequences));
  } catch {
    // localStorage unavailable (private browsing quota, etc.) — the app still works, just unpersisted.
  }
};
