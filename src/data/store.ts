import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { loadSequences, saveSequences } from "./localStorageSequences";
import sequencesReducer from "./sequences/sequencesSlice";

const preloadedSequences = loadSequences();

const store = configureStore({
  reducer: {
    sequences: sequencesReducer,
  },
  preloadedState: preloadedSequences ? { sequences: preloadedSequences } : undefined,
});

store.subscribe(() => saveSequences(store.getState().sequences));

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;
