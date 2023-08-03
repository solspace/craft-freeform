import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { ModalErrors, ModalState, UpdateValue } from './modal.types';

const initialState: ModalState = {
  values: {},
  initialValues: {},
  errors: undefined,
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<UpdateValue>) => {
      const { key, value } = payload;
      state.values[key] = value;
    },
    setInitialValues: (
      state,
      action: PayloadAction<Record<string, GenericValue>>
    ) => {
      state.initialValues = action.payload;
      state.values = action.payload;
    },
    removeError: (state, { payload }: PayloadAction<string>) => {
      delete state.errors[payload];
    },
    setErrors: (state, { payload }: PayloadAction<ModalErrors>) => {
      state.errors = payload;
    },
    clearErrors: (state) => {
      state.errors = undefined;
    },
    reset: (state) => {
      state.values = { ...state.initialValues };
    },
  },
});

const { actions } = modalSlice;
export { actions as modalActions };

export default modalSlice.reducer;
