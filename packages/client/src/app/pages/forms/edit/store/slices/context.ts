import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Page } from '../../builder/types/layout';
import { RootState } from '../store';

export enum FocusType {
  Page = 'page',
  Field = 'field',
  Row = 'row',
  Cell = 'cell',
}

type Focus = {
  type: FocusType;
  uid: string;
};

type ContextState = {
  page?: string;
  focus: Focus;
};

const initialState: ContextState = {
  page: null,
  focus: {
    type: null,
    uid: null,
  },
};

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setPage: (state, { payload }: PayloadAction<string | null>) => {
      state.page = payload;
    },
    setFocusedItem: (state, { payload }: PayloadAction<Focus>) => {
      state.focus = payload;
    },
    unfocus: (state) => {
      state.focus = { type: null, uid: null };
    },
  },
});

export const { setPage, setFocusedItem, unfocus } = contextSlice.actions;

export const selectCurrentPage = (state: RootState): Page => {
  const pageUid = state.context.page;
  if (pageUid) {
    return state.pages.find((page) => page.uid === pageUid);
  }

  return state.pages.find(Boolean);
};

export const selectFocus = (state: RootState): Focus => state.context.focus;

export default contextSlice.reducer;
