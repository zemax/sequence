import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CountdownStep } from "../../domains/steps/countdown/CountdownStep";
import { PauseStep } from "../../domains/steps/pause/PauseStep";
import examples from "../fixtures/examples.json";
import { getUI } from "../informations";

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

export const initialSequences: Sequence[] = examples as Sequence[];

export const sequencesSlice = createSlice({
  name: "sequences",
  initialState: initialSequences,
  reducers: {
    addSequence: (state, action) => {
      state.push(action.payload);
    },
    updateSequence: (state, action) => {
      const i = state.findIndex((s) => s.id === action.payload.id);
      state[i] = action.payload;
    },
    removeSequence: (state, action) => {
      const index = state.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    moveSequence: (state, action: PayloadAction<{ id: string; toIndex: number }>) => {
      const { id, toIndex } = action.payload;
      const fromIndex = state.findIndex((s) => s.id === id);
      if (fromIndex === -1) {
        return;
      }
      const [sequence] = state.splice(fromIndex, 1);
      state.splice(toIndex, 0, sequence);
    },
    setSequences: (_state, action: PayloadAction<Sequence[]>) => action.payload,
    resetSequences: () => structuredClone(initialSequences),
  },
});

export const { addSequence, removeSequence, updateSequence, moveSequence, setSequences, resetSequences } = sequencesSlice.actions;

export default sequencesSlice.reducer;

export const selectSequences = (state: any): Sequence[] => state.sequences;

export const selectSequence =
  (id: string) =>
  (state: any): Sequence =>
    state.sequences.filter((sequence: Sequence) => sequence.id === id)[0];

export const emptySequence = (): Sequence => ({
  id: (typeof window !== "undefined" && window.crypto.randomUUID()) || "",
  name: getUI().defaultSequenceName,
  items: [],
});
