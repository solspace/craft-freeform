import type { Layout, Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type RowState = Row[];

type SwapPayload = {
  currentUid: string;
  targetUid: string;
};

const initialState: RowState = [];

export const rowsSlice = createSlice({
  name: 'rows',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<RowState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<{ layoutUid: string; uid: string }>) => {
      const { layoutUid, uid } = action.payload;
      const highestOrder = Math.max(
        -1,
        ...state
          .filter((row) => row.layoutUid === layoutUid)
          .map((row) => row.order)
      );

      state.push({
        uid,
        order: highestOrder + 1,
        layoutUid,
      });
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

export const { set, add, swap, remove } = rowsSlice.actions;

export const selectRowsInLayout =
  (layout: Layout | undefined) =>
  (state: RootState): Row[] =>
    layout
      ? state.rows
          .filter((row) => row.layoutUid === layout.uid)
          .sort((a, b) => a.order - b.order)
      : [];

export default rowsSlice.reducer;
