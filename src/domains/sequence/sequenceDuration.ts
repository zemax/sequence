import { Sequence, Step } from "../../data/sequences/sequencesSlice";
import { flattenSequenceItems } from "./flattenSequenceItems";

const hasDuration = (item: Step): item is Step & { duration: number } => "duration" in item;

export const sequenceDuration = (sequence: Sequence): number | undefined => {
  const durations = flattenSequenceItems(sequence.items)
    .filter(hasDuration)
    .map((item) => item.duration);

  if (durations.length === 0) {
    return undefined;
  }

  return durations.reduce((total, duration) => total + duration, 0);
};
