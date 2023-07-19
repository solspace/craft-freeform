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
      const highestOrder = Math.max(
        -1,
        ...state
          .filter((row) => row.layoutUid === layoutUid)
          .map((row) => row.order)
      );

      state.push({
        uid,
        order: order !== undefined ? order : highestOrder + 1,
        layoutUid,
      });

      if (order !== undefined) {
        state.forEach((row) => {
          let currentOrder = row.order;
          if (row.uid !== uid) {
            if (row.order >= order) {
              currentOrder = currentOrder + 1;
            }
          }

          row.order = currentOrder;
        });
      }
    },
    remove: (state, action: PayloadAction<string>) => {
      const index = state.findIndex((row) => row.uid === action.payload);

      state.splice(index, 1);
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
