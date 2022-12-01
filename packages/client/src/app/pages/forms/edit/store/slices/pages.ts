import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type PagesState = Page[];

type SwapPayload = {
  currentUid: string;
  targetUid: string;
};

const initialState: PagesState = [];

export const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<PagesState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<Page>) => {
      const maxOrder = Math.max(...state.map((page) => page.order)) ?? -1;

      state.push({
        ...action.payload,
        order: maxOrder + 1,
      });
    },
    remove: (state, action: PayloadAction<string>) => {
      let order = 0;
      state = state
        .filter((page) => page.uid !== action.payload)
        .map((page) => ({ ...page, order: order++ }));
    },
    swap: (state, action: PayloadAction<SwapPayload>) => {
      const current = state.find(
        (page) => page.uid === action.payload.currentUid
      );
      const target = state.find(
        (page) => page.uid === action.payload.targetUid
      );

      const tempOrder = current.order;
      current.order = target.order;
      target.order = tempOrder;
    },
  },
});

export const { set, add, swap, remove } = pagesSlice.actions;

export const selectPages = (state: RootState): Page[] => state.pages;

export const selectPage =
  (uid: string) =>
  (state: RootState): Page | undefined =>
    state.pages.find((page) => page.uid === uid);

export default pagesSlice.reducer;
