import type { Cell, Row } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { SaveSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type CellState = Cell[];

type MoveToPayload = {
  uid: string;
  rowUid: string;
  position: number;
};

const initialState: CellState = [];

export const cellsSlice = createSlice({
  name: 'cells',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Omit<Cell, 'order'>>) => {
      const highestOrder =
        Math.max(
          ...state
            .filter((cell) => cell.rowUid === action.payload.rowUid)
            .map((cell) => cell.order)
        ) ?? -1;

      state.push({
        ...action.payload,
        order: highestOrder + 1,
      });
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

export const { moveTo, add, remove } = cellsSlice.actions;

export const selectCellsInRow =
  (row: Row) =>
  (state: RootState): Cell[] =>
    state.cells
      .filter((cell) => cell.rowUid === row.uid)
      .sort((a, b) => a.order - b.order);

export default cellsSlice.reducer;

const persist: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.cells = state.cells;
};

PubSub.subscribe(TOPIC_SAVE, persist);
