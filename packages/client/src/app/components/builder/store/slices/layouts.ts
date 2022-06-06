import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Layout } from '../../types/layout';

type LayoutState = Layout[];

const initialState: LayoutState = [];

export const layoutsSlice = createSlice({
  name: 'layouts',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Layout>) => {
      state.push(action.payload);
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((layout) => layout.uid !== action.payload);
    },
  },
});

export const { add, remove } = layoutsSlice.actions;

export default layoutsSlice.reducer;
