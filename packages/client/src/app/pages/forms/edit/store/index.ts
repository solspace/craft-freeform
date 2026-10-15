import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector, useStore } from "react-redux";
import { combineReducers } from "redux";

import history, { restore } from "./history";
import { createHistoryMiddleware } from "./middleware/history";
import { statePersistMiddleware } from "./middleware/state-persist";
import context from "./slices/context";
import form from "./slices/form";
import integrations from "./slices/integrations";
import layout from "./slices/layout";
import notifications from "./slices/notifications";
import optionSources from "./slices/option-sources";
import rules from "./slices/rules";
import search from "./slices/search";
import translations from "./slices/translations";

const combinedReducer = combineReducers({
  form,
  layout,
  integrations,
  notifications,
  optionSources,
  rules,
  context,
  search,
  translations,
  history,
});

export type RootState = ReturnType<typeof combinedReducer>;

export const reducer = (
  state: RootState | undefined,
  action: Action,
): RootState => {
  if (state && restore.match(action)) {
    const {
      form,
      layout,
      integrations,
      notifications,
      optionSources,
      rules,
      translations,
    } = action.payload;
    const page = layout.pages.some((item) => item.uid === state.context.page)
      ? state.context.page
      : (layout.pages[0]?.uid ?? null);
    const focus = state.context.focus;
    const focusedExists =
      (focus.type === "field" &&
        layout.fields.some((item) => item.uid === focus.uid)) ||
      (focus.type === "page" &&
        layout.pages.some((item) => item.uid === focus.uid)) ||
      (focus.type === "row" &&
        layout.rows.some((item) => item.uid === focus.uid));

    return {
      ...state,
      form: { ...form, id: state.form.id, errors: {} },
      layout,
      integrations,
      notifications,
      optionSources,
      rules,
      translations,
      context: {
        ...state.context,
        page,
        focus: focusedExists ? focus : { ...focus, active: false },
      },
    };
  }

  return combinedReducer(state, action);
};

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      createHistoryMiddleware(),
      statePersistMiddleware,
    ),
  reducer,
});

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, Action>;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore.withTypes<AppStore>();
