import { SequenceItem, Step } from "../../data/sequences/sequencesSlice";
import { flattenPlayback } from "./flattenPlayback";

export const flattenSequenceItems = (items: SequenceItem[]): Step[] => flattenPlayback(items).map((entry) => entry.step);
