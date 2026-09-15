import type {
  OptionsConfiguration,
  Source,
} from "@components/form-controls/control-types/options/options.types";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { fieldActions } from "../layout/fields";

// Inactive source configurations belong to the editing session, not the save payload.
type OptionSourcesState = Record<
  string,
  Record<string, Partial<Record<Source, OptionsConfiguration>>>
>;

const initialState: OptionSourcesState = {};

const optionSourcesSlice = createSlice({
  name: "optionSources",
  initialState,
  reducers: {
    remember: (
      state,
      {
        payload: { uid, handle, value },
      }: PayloadAction<{
        uid: string;
        handle: string;
        value: OptionsConfiguration;
      }>,
    ) => {
      state[uid] ??= {};
      state[uid][handle] ??= {};
      state[uid][handle][value.source] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fieldActions.set, () => ({}))
      .addCase(fieldActions.remove, (state, { payload: uid }) => {
        delete state[uid];
      })
      .addCase(fieldActions.removeBatch, (state, { payload: uids }) => {
        for (const uid of uids) {
          delete state[uid];
        }
      })
      .addCase(fieldActions.batchEdit, (state, { payload: { uid } }) => {
        // Changing the field type replaces its property configuration.
        delete state[uid];
      });
  },
});

export const optionSourceActions = optionSourcesSlice.actions;

export default optionSourcesSlice.reducer;
