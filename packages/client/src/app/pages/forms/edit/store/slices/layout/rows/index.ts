import type { Row } from '@editor/builder/types/layout';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type RowState = Row[];

type SwapPayload = {
  currentUid: string;
  targetUid: string;
};

const initialState: RowState = [];

export const rowsSlice = createSlice({
  name: 'layout/rows',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<RowState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (
      state,
      action: PayloadAction<{ layoutUid: string; uid: string; order?: number }>
    ) => {
      const { layoutUid, uid, order } = action.payload;

      const rows = state
        .filter((row) => row.layoutUid === layoutUid)
        .sort((a, b) => a.order - b.order);

      const highestOrder = rows.length;

      const insertIndex =
        order !== undefined
          ? rows.findIndex((row) => row.order === order)
          : highestOrder;

      state.splice(insertIndex, 0, {
        uid,
        order: insertIndex,
        layoutUid,
      });

      // Reset order
      state.forEach((row, index) => {
        row.order = index;
      });
    },
    remove: (state, action: PayloadAction<string>) => {
      const index = state.findIndex((row) => row.uid === action.payload);

      state.splice(index, 1);
      state.forEach((row, index) => {
        row.order = index;
      });
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

const { actions } = rowsSlice;
export { actions as rowActions };

export default rowsSlice.reducer;
