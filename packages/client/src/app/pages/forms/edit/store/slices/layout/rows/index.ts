import type { Row } from "@editor/builder/types/layout";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type RowState = Row[];

type SwapPayload = {
  currentUid: string;
  targetUid: string;
};

const initialState: RowState = [];

export const rowsSlice = createSlice({
  name: "layout/rows",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<RowState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (
      state,
      action: PayloadAction<{ layoutUid: string; uid: string; order?: number }>,
    ) => {
      const { layoutUid, uid, order } = action.payload;

      let insertIndex: number;
      if (order !== undefined) {
        insertIndex = state.findIndex(
          (row) => row.layoutUid === layoutUid && row.order === order,
        );
      } else {
        insertIndex = state.reduce((maxIndex, row, currentIndex) => {
          if (
            row.layoutUid === layoutUid &&
            row.order > state[maxIndex]?.order
          ) {
            return currentIndex;
          } else {
            return maxIndex;
          }
        }, -1);
        insertIndex = insertIndex === -1 ? state.length : insertIndex;
      }

      state.splice(insertIndex, 0, {
        uid,
        order: insertIndex,
        layoutUid,
      });

      // Reset order
      state
        .filter((row) => row.layoutUid === layoutUid)
        .forEach((row, index) => {
          row.order = index;
        });
    },
    remove: (state, action: PayloadAction<string>) => {
      const index = state.findIndex((row) => row.uid === action.payload);
      const layoutUid = state.find(
        (row) => row.uid === action.payload,
      ).layoutUid;

      state.splice(index, 1);
      state
        .filter((row) => row.layoutUid === layoutUid)
        .forEach((row, index) => {
          row.order = index;
        });
    },
    swap: (state, action: PayloadAction<SwapPayload>) => {
      const current = state.find(
        (row) => row.uid === action.payload.currentUid,
      );
      const target = state.find((row) => row.uid === action.payload.targetUid);

      const tempOrder = current.order;
      current.order = target.order;
      target.order = tempOrder;
    },
    moveToLayout: (
      state,
      { payload }: PayloadAction<{ uid: string; layoutUid: string }>,
    ) => {
      const row = state.find((row) => row.uid === payload.uid);
      if (!row) return;
      const previousLayout = row.layoutUid;
      row.layoutUid = payload.layoutUid;
      row.order =
        Math.max(
          -1,
          ...state
            .filter(
              (item) =>
                item.uid !== row.uid && item.layoutUid === payload.layoutUid,
            )
            .map((item) => item.order),
        ) + 1;
      state
        .filter((item) => item.layoutUid === previousLayout)
        .sort((a, b) => a.order - b.order)
        .forEach((item, order) => {
          item.order = order;
        });
    },
    moveToLayoutAt: (
      state,
      {
        payload,
      }: PayloadAction<{ uid: string; layoutUid: string; order: number }>,
    ) => {
      const row = state.find((item) => item.uid === payload.uid);
      if (!row) return;
      const previousLayout = row.layoutUid;
      const previousRows = state
        .filter(
          (item) => item.layoutUid === previousLayout && item.uid !== row.uid,
        )
        .sort((a, b) => a.order - b.order);
      const destinationRows = state
        .filter(
          (item) =>
            item.layoutUid === payload.layoutUid && item.uid !== row.uid,
        )
        .sort((a, b) => a.order - b.order);
      row.layoutUid = payload.layoutUid;
      destinationRows.splice(
        Math.max(0, Math.min(payload.order, destinationRows.length)),
        0,
        row,
      );
      destinationRows.forEach((item, index) => {
        item.order = index;
      });
      if (previousLayout !== payload.layoutUid)
        previousRows.forEach((item, index) => {
          item.order = index;
        });
    },
  },
});

const { actions } = rowsSlice;

export { actions as rowActions };

export default rowsSlice.reducer;
