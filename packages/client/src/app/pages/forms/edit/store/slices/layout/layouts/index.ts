import type { Layout } from '@editor/builder/types/layout';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import './layouts.persistence';

type LayoutState = Layout[];

const initialState: LayoutState = [];

export const layoutsSlice = createSlice({
  name: 'layout/layouts',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<LayoutState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<Layout>) => {
      state.push(action.payload);
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((layout) => layout.uid !== action.payload);
    },
  },
});

const { actions } = layoutsSlice;
export { actions as layoutActions };

export default layoutsSlice.reducer;
