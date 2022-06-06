import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Page } from '../../types/layout';

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
    add: (state, action: PayloadAction<Page>) => {
      state.push(action.payload);
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((page) => page.uid !== action.payload);
    },
    swap: (state, action: PayloadAction<SwapPayload>) => {
      const current = state.find((page) => page.uid === action.payload.currentUid);
      const target = state.find((page) => page.uid === action.payload.targetUid);

      const tempOrder = current.order;
      current.order = target.order;
      target.order = tempOrder;
    },
  },
});

export const { swap, add, remove } = pagesSlice.actions;

export default pagesSlice.reducer;
