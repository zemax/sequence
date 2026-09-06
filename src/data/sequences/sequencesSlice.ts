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

const initialSequences: Sequence[] = [
  {
    id: "1",
    name: "Exercices quotidien",
    items: [
      { id: "1", type: "pause", title: "Appuyez quand vous êtes prêt" },
      { id: "2", type: "countdown", title: "C'est parti pour la planche, bras gauche au sol", duration: 5 },
      { id: "3", type: "countdown", title: "On tient la planche bras gauche", duration: 30 },
      { id: "4", type: "countdown", title: "Repos", duration: 30 },
      { id: "5", type: "countdown", title: "On tient la planche bras droit", duration: 30 },
      { id: "6", type: "countdown", title: "Repos", duration: 30 },
      { id: "7", type: "countdown", title: "On tient la planche bras gauche", duration: 45 },
      { id: "8", type: "countdown", title: "Repos", duration: 30 },
      { id: "9", type: "countdown", title: "On tient la planche bras droit", duration: 45 },
      { id: "10", type: "pause", title: "Bravo" },
    ],
  },
  {
    id: "2",
    name: "Recette des œufs mollets",
    items: [
      { id: "11", type: "pause", title: "Faites bouillir de l'eau" },
      { id: "12", type: "pause", title: "Plongez les œufs dans l'eau" },
      { id: "13", type: "countdown", title: "Cuisson", duration: 330 },
      { id: "14", type: "pause", title: "Sortez la casserole du feu et remplacez l'eau par de l'eau froide" },
      { id: "15", type: "pause", title: "Écalez les œufs délicatement, sous un filet d'eau froide" },
    ],
  },
];

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
