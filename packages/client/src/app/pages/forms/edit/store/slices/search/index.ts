import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export enum Search {
  Fields = 'fields',
}

export type SearchType = { [key in Search]: string };

const initialState: SearchType = {
  fields: '',
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    update: (
      state,
      action: PayloadAction<{ type: keyof SearchType; query: string }>
    ) => {
      state[action.payload.type] = action.payload.query;
    },
    clear: (state, action: PayloadAction<keyof SearchType>) => {
      state[action.payload] = '';
    },
  },
});

const { actions } = searchSlice;
export { actions as searchActions };

export default searchSlice.reducer;
