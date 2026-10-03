import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export const SOUND_LEVEL_COUNT = 4;

export interface Settings {
  soundMuted: boolean;
  // 1 (the discreet default beep) to SOUND_LEVEL_COUNT (the loudest alarm).
  soundLevel: number;
}

export const initialSettings: Settings = {
  soundMuted: false,
  soundLevel: 1,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: initialSettings,
  reducers: {
    setSoundMuted: (state, action: PayloadAction<boolean>) => {
      state.soundMuted = action.payload;
    },
    setSoundLevel: (state, action: PayloadAction<number>) => {
      state.soundLevel = action.payload;
    },
  },
});

export const { setSoundMuted, setSoundLevel } = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSoundMuted = (state: any): boolean => state.settings.soundMuted;

export const selectSoundLevel = (state: any): number => state.settings.soundLevel;
