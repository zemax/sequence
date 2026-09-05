import { createSlice } from "@reduxjs/toolkit";
import { CountdownStep } from "../../domains/steps/countdown/CountdownStep";
import { PauseStep } from "../../domains/steps/pause/PauseStep";

// Union of every Step type. Extend here when adding a new Step type.
export type Step = CountdownStep | PauseStep;

export interface Loop {
  id: string;
  type: "loop";
  steps: Step[];
  repeatCount: number;
}

export type SequenceItem = Step | Loop;

export const isLoop = (item: SequenceItem): item is Loop => item.type === "loop";

export interface Sequence {
  id: string;
  name: string;
  items: SequenceItem[];
}

export const sequencesSlice = createSlice({
  name: "sequences",
  initialState: [
    {
      id: "1",
      name: "Sequence 1",
      items: [],
    },
    {
      id: "2",
      name: "Sequence 2",
      items: [],
    },
  ],
  reducers: {
    addSequence: (state, action) => {
      state.push(action.payload);
    },
    updateSequence: (state, action) => {
      const i = state.findIndex((s) => s.id === action.payload.id);
      state[i] = action.payload;
    },
    removeSequence: (state, action) => {
      state = state.filter((s) => s.id !== action.payload.id);
    },
  },
});

export const { addSequence, removeSequence, updateSequence } = sequencesSlice.actions;

export default sequencesSlice.reducer;

export const selectSequences = (state: any): Sequence[] => state.sequences;

export const selectSequence =
  (id: string) =>
  (state: any): Sequence =>
    state.sequences.filter((sequence: Sequence) => sequence.id === id)[0];

export const emptySequence = (): Sequence => ({
  id: (typeof window !== "undefined" && window.crypto.randomUUID()) || "",
  name: "",
  items: [],
});
