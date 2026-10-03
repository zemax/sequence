import { SequenceItem, Step, isLoop } from "../../data/sequences/sequencesSlice";

export type PlaybackLoop = {
  iteration: number;
  repeatCount: number;
  // Index, in the flattened list, of the first entry after the whole Loop (every iteration).
  exitIndex: number;
};

export type PlaybackEntry = {
  step: Step;
  loop?: PlaybackLoop;
};

// A Loop expands into its Steps repeated `repeatCount` times; each expanded entry remembers
// which iteration it belongs to and where the Loop ends, so the player can skip past it.
export const flattenPlayback = (items: SequenceItem[]): PlaybackEntry[] => {
  const entries: PlaybackEntry[] = [];

  for (const item of items) {
    if (!isLoop(item)) {
      entries.push({ step: item });
      continue;
    }

    const exitIndex = entries.length + item.steps.length * item.repeatCount;
    for (let iteration = 1; iteration <= item.repeatCount; iteration++) {
      for (const step of item.steps) {
        entries.push({ step, loop: { iteration, repeatCount: item.repeatCount, exitIndex } });
      }
    }
  }

  return entries;
};
