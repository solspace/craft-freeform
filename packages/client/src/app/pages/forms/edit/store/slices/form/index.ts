import type { FormSettingNamespace } from '@ff-client/types/forms';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

import './form.persistence';

import type {
  FormErrors,
  FormState,
  ModifyProps,
  UpdateProps,
} from './form.types';

const initialState: FormState = {
  id: null,
  uid: v4(),
  type: 'Solspace\\Freeform\\Form\\Types\\Regular',
  name: 'New Form',
  handle: 'newForm',
  settings: {},
  errors: {},
};

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<UpdateProps>) => {
      Object.assign(state, payload);
    },
    setInitialSettings: (
      state,
      action: PayloadAction<FormSettingNamespace[]>
    ) => {
      if (Object.entries(state.settings).length > 0) return;

      for (const namespace of action.payload) {
        state.settings[namespace.handle] = {};

        for (const property of namespace.properties) {
          state.settings[namespace.handle][property.handle] = property.value;
        }
      }
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

const { actions } = formSlice;
export { actions as formActions };

export default formSlice.reducer;
