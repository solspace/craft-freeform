import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

type DragState = {
  cellUid?: string;
  rowUid?: string;
  position?: number;
};

const initialState: DragState = {
  cellUid: undefined,
  rowUid: undefined,
  position: undefined,
};

export const dragSlice = createSlice({
  name: 'drag',
  initialState,
  reducers: {
    setRow: (state, action: PayloadAction<string>) => {
      state.rowUid = action.payload;
    },
    setCell: (state, action: PayloadAction<string>) => {
      state.cellUid = action.payload;
    },
    setPosition: (state, action: PayloadAction<number>) => {
      state.position = action.payload;
    },
  },
});

export const { setRow, setCell, setPosition } = dragSlice.actions;

export const selectCurrentRow = (state: RootState): string | undefined =>
  state.drag.rowUid;

export const selectCurrentCell = (state: RootState): string | undefined =>
  state.drag.cellUid;

export const selectCurrentPosition = (state: RootState): number | undefined =>
  state.drag.position;

export default dragSlice.reducer;
