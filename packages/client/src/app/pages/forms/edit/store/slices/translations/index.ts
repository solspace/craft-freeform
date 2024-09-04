import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import './translations.persistence';

import type { TranslationState, UpdateProps } from './translations.types';

const initialState: TranslationState = [];

export const translationSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<UpdateProps>) => {
      const { siteId, type, namespace, handle, value } = payload;
      if (state[siteId] === undefined) {
        state[siteId] = {
          fields: {},
          form: {},
          buttons: {},
        };
      }

      state[siteId][type][namespace][handle] = value;
    },
    init: (state, action: PayloadAction<TranslationState>) => {
      return action.payload;
    },
  },
});

const { actions } = translationSlice;
export { actions as translationActions };

export default translationSlice.reducer;
