import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector, useStore } from "react-redux";

import { statePersistMiddleware } from "./middleware/state-persist";
import context from "./slices/context";
import form from "./slices/form";
import integrations from "./slices/integrations";
import layout from "./slices/layout";
import notifications from "./slices/notifications";
import rules from "./slices/rules";
import search from "./slices/search";
import translations from "./slices/translations";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(statePersistMiddleware),
  reducer: {
    form,
    layout,
    integrations,
    notifications,
    rules,
    context,
    search,
    translations,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, Action>;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore.withTypes<AppStore>();
