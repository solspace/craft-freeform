import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export enum FocusType {
  Page = 'page',
  Field = 'field',
  Row = 'row',
  Cell = 'cell',
}

type Focus = {
  active: boolean;
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
    active: false,
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
    setFocusedItem: (
      state,
      { payload }: PayloadAction<Omit<Focus, 'active'>>
    ) => {
      state.focus = { active: true, ...payload };
    },
    focus: (state) => {
      state.focus.active = true;
    },
    unfocus: (state) => {
      state.focus.active = false;
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
