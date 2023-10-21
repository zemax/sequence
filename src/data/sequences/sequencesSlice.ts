import { createSlice } from "@reduxjs/toolkit";

export interface Step {
  id: string;
  name: string;
  duration: number;
}

export interface Sequence {
  id: string;
  name: string;
  steps: Step[];
}

export const sequencesSlice = createSlice({
  name: "sequences",
  initialState: [
    {
      id: "1",
      name: "Sequence 1",
      steps: [],
    },
    {
      id: "2",
      name: "Sequence 2",
      steps: [],
    },
  ],
  reducers: {
    addSequence: (state, action) => {
      state.push(action.payload);
    },
    removeSequence: (state, action) => {},
    updateSequence: (state, action) => {},
  },
});

export const { addSequence, removeSequence, updateSequence } = sequencesSlice.actions;

export default sequencesSlice.reducer;

export const selectSequences = (state: any): Sequence[] => state.sequences;

export const selectSequence =
  (id: string) =>
  (state: any): Sequence =>
    state.sequences.filter((sequence: Sequence) => sequence.id === id)[0];
