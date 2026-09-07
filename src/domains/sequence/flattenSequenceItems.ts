import { SequenceItem, Step, isLoop } from "../../data/sequences/sequencesSlice";

export const flattenSequenceItems = (items: SequenceItem[]): Step[] =>
  items.flatMap((item) => (isLoop(item) ? Array.from({ length: item.repeatCount }, () => item.steps).flat() : [item]));
