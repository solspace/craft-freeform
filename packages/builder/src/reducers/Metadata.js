import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const selectAllMetadata = (state) => state;

export const selectMetadata =
  (key, defaultValue = null) =>
  (state) => {
    return state[key] === undefined ? defaultValue : state[key];
  };

export const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    modify: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
  },
});

export const { modify } = metadataSlice.actions;

export default metadataSlice.reducer;
