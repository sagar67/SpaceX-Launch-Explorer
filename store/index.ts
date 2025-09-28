import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { spacexApi } from "../services/spacexApi";

export const index = configureStore({
  reducer: {
    [spacexApi.reducerPath]: spacexApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(spacexApi.middleware),
});

setupListeners(index.dispatch);

export type RootState = ReturnType<typeof index.getState>;
export type AppDispatch = typeof index.dispatch;
