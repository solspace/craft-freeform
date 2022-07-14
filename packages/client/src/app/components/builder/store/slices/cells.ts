import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Cell, CellType, Row } from '../../types/layout';
import { RootState } from '../store';

type CellState = Cell[];

type MoveToPayload = {
  uid: string;
  rowUid: string;
  position: number;
};

const initialState: CellState = [
  {
    uid: 'cell-uid-1',
    rowUid: 'row-uid-1',
    order: 1,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-2',
    rowUid: 'row-uid-1',
    order: 2,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-3',
    rowUid: 'row-uid-1',
    order: 3,
    type: CellType.Layout,
    metadata: { layoutUid: 'layout-uid-2' },
  },
  {
    uid: 'cell-uid-4',
    rowUid: 'row-uid-1',
    order: 4,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-5',
    rowUid: 'row-uid-2',
    order: 1,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-6',
    rowUid: 'row-uid-2',
    order: 2,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-7',
    rowUid: 'row-uid-3',
    order: 1,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-8',
    rowUid: 'row-uid-3',
    order: 2,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-9',
    rowUid: 'row-uid-3',
    order: 3,
    type: CellType.Field,
    metadata: {},
  },
  {
    uid: 'cell-uid-10',
    rowUid: 'row-uid-4',
    order: 1,
    type: CellType.Field,
    metadata: {},
  },
];

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

export const selectCellsInRow =
  (row: Row) =>
  (state: RootState): Cell[] =>
    state.cells
      .filter((cell) => cell.rowUid === row.uid)
      .sort((a, b) => a.order - b.order);

export default cellsSlice.reducer;
