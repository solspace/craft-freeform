import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Layout, Page } from '../../types/layout';
import { RootState } from '../store';

type LayoutState = Layout[];

const initialState: LayoutState = [
  { uid: 'layout-uid-1' },
  { uid: 'layout-uid-2' },
];

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

export const selectLayout =
  (uid: string) =>
  (state: RootState): Layout | undefined =>
    state.layouts.find((layout) => layout.uid === uid);

export const selectPageLayout =
  (page: Page) =>
  (state: RootState): Layout | undefined =>
    state.layouts.find((layout) => layout.uid === page.layoutUid);

export default layoutsSlice.reducer;
