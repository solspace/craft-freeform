import type { Cell, Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type CellState = Cell[];

type MoveToPayload = {
  uid: string;
  rowUid: string;
  position: number;
};

const initialState: CellState = [];

type AddPayload = Omit<Cell, 'order'> & {
  order?: number;
};

export const cellsSlice = createSlice({
  name: 'cells',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<CellState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<AddPayload>) => {
      const { uid, rowUid, order } = action.payload;
      const highestOrder = Math.max(
        -1,
        ...state
          .filter((cell) => cell.rowUid === action.payload.rowUid)
          .map((cell) => cell.order)
      );

      state.push({
        ...action.payload,
        order: order !== undefined ? order : highestOrder + 1,
      });

      if (order !== undefined) {
        state.forEach((cell) => {
          if (cell.rowUid !== rowUid) {
            return;
          }

          let currentOrder = cell.order;
          if (cell.uid !== uid) {
            if (cell.order >= order) {
              currentOrder = currentOrder + 1;
            }
          }

          cell.order = currentOrder;
        });
      }
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((cell) => cell.uid !== action.payload);
    },
    moveTo: (state, action: PayloadAction<MoveToPayload>) => {
      // TODO: implement
      console.log(action);
    },
  },
});

export const { set, moveTo, add, remove } = cellsSlice.actions;

export const selectCellsInRow =
  (row: Row) =>
  (state: RootState): Cell[] =>
    state.cells
      .filter((cell) => cell.rowUid === row.uid)
      .sort((a, b) => a.order - b.order);

export default cellsSlice.reducer;
