import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import sequencesReducer from "./sequences/sequencesSlice";

const store = configureStore({
  reducer: {
    sequences: sequencesReducer,
  },
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;
