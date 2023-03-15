import type { RootState } from '@editor/store';
import type {
  CreatedSubscriber,
  ErrorsSubscriber,
  SaveSubscriber,
} from '@editor/store/middleware/state-persist';
import { TOPIC_UPSERTED } from '@editor/store/middleware/state-persist';
import {
  TOPIC_CREATED,
  TOPIC_ERRORS,
  TOPIC_SAVE,
} from '@editor/store/middleware/state-persist';
import type { Form, SettingsNamespace } from '@ff-client/types/forms';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import PubSub from 'pubsub-js';
import { v4 } from 'uuid';

type FormErrors = {
  [key: string]: {
    [key: string]: string[];
  };
};

type FormState = Form & {
  errors: FormErrors;
};

const initialState: FormState = {
  id: null,
  uid: v4(),
  type: 'Solspace\\Freeform\\Form\\Types\\Regular',
  name: 'New Form',
  handle: 'newForm',
  settings: {},
  errors: {},
};

export type UpdateProps = Partial<Omit<FormState, 'properties'>>;

export type ModifyProps = {
  key: string;
  namespace: string;
  value: GenericValue;
};

export type ErrorProps = {
  key: string;
  errors: string[];
};

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<UpdateProps>) => {
      Object.assign(state, payload);
    },
    modifySettings: (state, { payload }: PayloadAction<ModifyProps>) => {
      const { namespace, key, value } = payload;

      if (!state.settings[namespace]) {
        state.settings[namespace] = {};
      }

      state.settings[namespace][key] = value;
    },
    removeError: (state, { payload }: PayloadAction<string>) => {
      delete state.errors[payload];
    },
    setErrors: (state, { payload }: PayloadAction<FormErrors>) => {
      state.errors = payload;
    },
    clearErrors: (state) => {
      state.errors = undefined;
    },
  },
});

export const { update, modifySettings, removeError, setErrors, clearErrors } =
  formSlice.actions;

export const selectForm = (state: RootState): Form | undefined => state.form;
export const selectFormSettings =
  (namespace: string) =>
  (state: RootState): SettingsNamespace =>
    state.form.settings?.[namespace] || {};

export const selectFormSetting =
  (namespace: string, key: string) =>
  (state: RootState): any =>
    state.form.settings?.[namespace]?.[key];

export const selectFormErrors = (state: RootState): FormErrors =>
  state.form.errors;

export default formSlice.reducer;

const persist: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  const { id, uid, type, settings } = state.form;

  persist.form = {
    id,
    uid,
    type,
    settings,
  };
};

const handleErrors: ErrorsSubscriber = (_, { dispatch, response }) => {
  dispatch(clearErrors());
  dispatch(setErrors(response.errors?.form as FormErrors));
};

const handleUpsert: ErrorsSubscriber = (_, { dispatch }) => {
  dispatch(clearErrors());
};

const handleCreate: CreatedSubscriber = (_, { dispatch, response }) => {
  dispatch(update({ id: response.data.form.id }));
};

PubSub.subscribe(TOPIC_SAVE, persist);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_CREATED, handleCreate);
PubSub.subscribe(TOPIC_UPSERTED, handleUpsert);
