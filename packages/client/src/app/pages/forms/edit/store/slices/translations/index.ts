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

      if (state[siteId][type] === undefined) {
        state[siteId][type] = {};
      }

      if (state[siteId][type][namespace] === undefined) {
        state[siteId][type][namespace] = {};
      }

      state[siteId][type][namespace][handle] = value;
    },
    init: (_, action: PayloadAction<TranslationState>) => {
      return action.payload;
    },
  },
});

const { actions } = translationSlice;
export { actions as translationActions };

export default translationSlice.reducer;
