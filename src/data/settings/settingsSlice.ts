import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Settings {
  soundMuted: boolean;
}

export const initialSettings: Settings = {
  soundMuted: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: initialSettings,
  reducers: {
    setSoundMuted: (state, action: PayloadAction<boolean>) => {
      state.soundMuted = action.payload;
    },
  },
});

export const { setSoundMuted } = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSoundMuted = (state: any): boolean => state.settings.soundMuted;
