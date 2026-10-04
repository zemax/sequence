import { SequenceItem, Step, isLoop } from "../../data/sequences/sequencesSlice";

export type PlaybackLoop = {
  iteration: number;
  repeatCount: number;
  // First flattened index after the whole Loop.
  exitIndex: number;
};

export type PlaybackEntry = {
  step: Step;
  loop?: PlaybackLoop;
};

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
