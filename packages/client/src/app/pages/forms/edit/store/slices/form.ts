import type { RootState } from '@editor/store';
import type {
  CreatedSubscriber,
  ErrorsSubscriber,
  SaveSubscriber,
} from '@editor/store/middleware/state-persist';
import {
  TOPIC_CREATED,
  TOPIC_ERRORS,
  TOPIC_SAVE,
} from '@editor/store/middleware/state-persist';
import type { ErrorList } from '@ff-client/types/api';
import type { Form, SettingsNamespace } from '@ff-client/types/forms';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import PubSub from 'pubsub-js';
import { v4 } from 'uuid';

type FormState = Form & {
  errors?: ErrorList;
  processing?: boolean;
};

const initialState: FormState = {
  id: null,
  uid: v4(),
  type: 'Solspace\\Freeform\\Form\\Types\\Regular',
  name: 'New Form',
  handle: 'newForm',
  settings: {},
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
    addError: (state, { payload }: PayloadAction<ErrorProps>) => {
      state.errors[payload.key] = payload.errors;
    },
    setErrors: (state, { payload }: PayloadAction<ErrorList>) => {
      state.errors = payload;
    },
    clearErrors: (state) => {
      state.errors = undefined;
    },
    setProcessing: (state, { payload }: PayloadAction<boolean>) => {
      state.processing = payload;
    },
  },
});

export const {
  update,
  modifySettings,
  addError,
  removeError,
  setErrors,
  clearErrors,
  setProcessing,
} = formSlice.actions;

export const selectForm = (state: RootState): Form | undefined => state.form;
export const selectFormSettings =
  (namespace: string) =>
  (state: RootState): SettingsNamespace =>
    state.form.settings?.[namespace] || {};

export const selectFormSetting =
  (namespace: string, key: string) =>
  (state: RootState): any =>
    state.form.settings?.[namespace]?.[key];

export const selectFormProcessing = (state: RootState): boolean =>
  state.form.processing || false;

export default formSlice.reducer;

const persistForm: SaveSubscriber = (_, data) => {
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
  dispatch(setErrors(response.errors?.form));
};

const handleCreate: CreatedSubscriber = (_, { dispatch, response }) => {
  dispatch(update({ id: response.data.form.id }));
};

PubSub.subscribe(TOPIC_SAVE, persistForm);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_CREATED, handleCreate);
