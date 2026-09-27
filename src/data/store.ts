import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { loadSequences, saveSequences } from "./localStorageSequences";
import { loadSettings, saveSettings } from "./localStorageSettings";
import sequencesReducer from "./sequences/sequencesSlice";
import settingsReducer from "./settings/settingsSlice";

const preloadedSequences = loadSequences();
const preloadedSettings = loadSettings();

const store = configureStore({
  reducer: {
    sequences: sequencesReducer,
    settings: settingsReducer,
  },
  preloadedState: {
    ...(preloadedSequences ? { sequences: preloadedSequences } : {}),
    ...(preloadedSettings ? { settings: preloadedSettings } : {}),
  },
});

store.subscribe(() => {
  saveSequences(store.getState().sequences);
  saveSettings(store.getState().settings);
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;
