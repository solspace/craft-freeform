import type { RootState } from "@editor/store";
import { createAction, createSlice } from "@reduxjs/toolkit";

// Keep navigation and request state outside snapshots. They are UI state, not edits.
export type BuilderSnapshot = Pick<
  RootState,
  | "form"
  | "layout"
  | "integrations"
  | "notifications"
  | "optionSources"
  | "rules"
  | "translations"
>;

export const snapshot = (state: RootState): BuilderSnapshot => ({
  form: state.form,
  layout: state.layout,
  integrations: state.integrations,
  notifications: state.notifications,
  optionSources: state.optionSources,
  rules: state.rules,
  translations: state.translations,
});

export const restore = createAction<BuilderSnapshot>("history/restore");

const historySlice = createSlice({
  name: "history",
  initialState: { undoCount: 0, redoCount: 0 },
  reducers: {
    setCounts: (
      _,
      { payload }: { payload: { undoCount: number; redoCount: number } },
    ) => payload,
    clear: () => ({ undoCount: 0, redoCount: 0 }),
    undo: () => {},
    redo: () => {},
  },
});

export const historyActions = historySlice.actions;
export default historySlice.reducer;
