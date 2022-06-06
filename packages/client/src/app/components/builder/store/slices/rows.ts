import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Row } from '../../types/layout';

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
    add: (state, action: PayloadAction<Row>) => {
      state.push(action.payload);
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((row) => row.uid !== action.payload);
    },
    swap: (state, action: PayloadAction<SwapPayload>) => {
      const current = state.find((row) => row.uid === action.payload.currentUid);
      const target = state.find((row) => row.uid === action.payload.targetUid);

      const tempOrder = current.order;
      current.order = target.order;
      target.order = tempOrder;
    },
  },
});

export const { swap, add, remove } = rowsSlice.actions;

export default rowsSlice.reducer;
