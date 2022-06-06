import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Cell } from '../../types/layout';

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
    add: (state, action: PayloadAction<Cell>) => {
      state.push(action.payload);
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

export default cellsSlice.reducer;
