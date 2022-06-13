import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Layout, Row } from '../../types/layout';
import { RootState } from '../store';

type RowState = Row[];

type SwapPayload = {
  currentUid: string;
  targetUid: string;
};

const initialState: RowState = [
  { uid: 'row-uid-1', layoutUid: 'layout-uid-1', order: 1 },
  { uid: 'row-uid-2', layoutUid: 'layout-uid-1', order: 2 },
  { uid: 'row-uid-3', layoutUid: 'layout-uid-2', order: 1 },
];

export const rowsSlice = createSlice({
  name: 'rows',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Row>) => {
      state.push(action.payload);
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((row) => row.uid !== action.payload);
    },
    swap: (state, action: PayloadAction<SwapPayload>) => {
      const current = state.find(
        (row) => row.uid === action.payload.currentUid
      );
      const target = state.find((row) => row.uid === action.payload.targetUid);

      const tempOrder = current.order;
      current.order = target.order;
      target.order = tempOrder;
    },
  },
});

export const { swap, add, remove } = rowsSlice.actions;

export const selectRowsInLayout =
  (layout: Layout | undefined) =>
  (state: RootState): Row[] =>
    layout
      ? state.rows
          .filter((row) => row.layoutUid === layout.uid)
          .sort((a, b) => a.order - b.order)
      : [];

export default rowsSlice.reducer;
