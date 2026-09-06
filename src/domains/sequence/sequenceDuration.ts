import { Sequence, SequenceItem, isLoop } from "../../data/sequences/sequencesSlice";

const hasDuration = (item: SequenceItem): item is SequenceItem & { duration: number } =>
  !isLoop(item) && "duration" in item;

export const sequenceDuration = (sequence: Sequence): number | undefined => {
  const durations = sequence.items.filter(hasDuration).map((item) => item.duration);

  if (durations.length === 0) {
    return undefined;
  }

  return durations.reduce((total, duration) => total + duration, 0);
};
