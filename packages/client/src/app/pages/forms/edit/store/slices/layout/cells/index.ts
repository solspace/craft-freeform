import type { Cell } from '@editor/builder/types/layout';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type CellStore = Cell[];

type MoveToPayload = {
  uid: string;
  rowUid: string;
  position: number;
};

const initialState: CellStore = [];

type AddPayload = Omit<Cell, 'order'> & {
  order?: number;
};

export const cellsSlice = createSlice({
  name: 'layout/cells',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<CellStore>) => {
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

      // shift all other cells on the right by 1 order
      if (order !== undefined) {
        state
          .filter((cell) => cell.rowUid === rowUid)
          .filter((cell) => cell.uid !== uid)
          .forEach((cell) => {
            if (cell.order >= order) {
              cell.order += 1;
            }
          });
      }
    },
    remove: (state, action: PayloadAction<string>) => {
      state.splice(
        state.findIndex((cell) => cell.uid === action.payload),
        1
      );
    },
    removeBatch: (state, { payload: uids }: PayloadAction<string[]>) => {
      uids.forEach((uid) => {
        state.splice(
          state.findIndex((cell) => cell.uid === uid),
          1
        );
      });
    },
    moveTo: (state, action: PayloadAction<MoveToPayload>) => {
      const { uid, rowUid, position } = action.payload;
      const movedCell = state.find((cell) => cell.uid === uid);

      const previosRowUid = movedCell.rowUid;
      const previousPosition = movedCell.order;
      const isSameRow = previosRowUid === rowUid;

      if (previousPosition === undefined) {
        return;
      }

      movedCell.rowUid = rowUid;
      movedCell.order = position;

      if (!isSameRow) {
        // Reset the order of cells in previous row
        state
          .filter((cell) => cell.rowUid === previosRowUid)
          .forEach((cell) => {
            const isAfterMovedCell = cell.order >= previousPosition;
            cell.order -= isAfterMovedCell ? 1 : 0;
          });

        // update all new row orders after the new cell
        state
          .filter((cell) => cell.rowUid === rowUid)
          .filter((cell) => cell.uid !== movedCell.uid)
          .forEach((cell) => {
            const isAfterMovedCell = cell.order >= movedCell.order;
            cell.order += isAfterMovedCell ? 1 : 0;
          });
      }

      if (isSameRow) {
        // re-calculate orders for the current row
        state
          .filter((cell) => cell.rowUid === rowUid)
          .filter((cell) => cell.uid !== movedCell.uid)
          .forEach((cell) => {
            if (cell.order > previousPosition && cell.order <= position) {
              cell.order -= 1;
            }

            if (cell.order < previousPosition && cell.order >= position) {
              cell.order += 1;
            }
          });
      }
    },
  },
});

const { actions } = cellsSlice;
export { actions as cellActions };

export default cellsSlice.reducer;
