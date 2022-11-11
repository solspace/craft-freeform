import type { Layout, Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { SaveSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

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

const persist: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  const { layouts, cells, rows, pages } = state;

  persist.layout = {
    pages,
    layouts,
    rows,
    cells,
  };
};

PubSub.subscribe(TOPIC_SAVE, persist);
