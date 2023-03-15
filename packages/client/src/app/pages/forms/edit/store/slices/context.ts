import type { Page } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { hasErrors } from '@ff-client/utils/errors';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export enum FocusType {
  Page = 'page',
  Field = 'field',
  Row = 'row',
  Cell = 'cell',
}

export enum State {
  Idle,
  Processing,
}

type Focus = {
  active: boolean;
  type: FocusType;
  uid: string;
};

type ContextState = {
  page?: string;
  focus: Focus;
  state: State;
};

const initialState: ContextState = {
  state: State.Idle,
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
    setState: (state, { payload }: PayloadAction<State>) => {
      state.state = payload;
    },
    focus: (state) => {
      state.focus.active = true;
    },
    unfocus: (state) => {
      state.focus.active = false;
    },
  },
});

export const { setPage, setFocusedItem, setState, unfocus } =
  contextSlice.actions;

export const selectCurrentPage = (state: RootState): Page | undefined => {
  const pageUid = state.context.page;
  if (pageUid) {
    return state.pages.find((page) => page.uid === pageUid);
  }

  return state.pages.find(Boolean);
};

export const selectPageHasErrors =
  (uid: string) =>
  (state: RootState): boolean => {
    let pageHasErrors = false;

    const fieldUidsWithErrors = state.fields
      .filter((field) => hasErrors(field.errors))
      .map((field) => field.uid);

    const layoutUid = state.pages.find((page) => page.uid === uid).layoutUid;

    state.rows
      .filter((row) => row.layoutUid === layoutUid)
      .forEach((row) => {
        if (pageHasErrors) {
          return;
        }

        const cells = state.cells.filter((cell) => cell.rowUid === row.uid);

        cells.forEach((cell) => {
          if (
            cell.type === CellType.Field &&
            fieldUidsWithErrors.includes(cell.targetUid)
          ) {
            pageHasErrors = true;
          }
        });
      });

    return pageHasErrors;
  };

export const selectFocus = (state: RootState): Focus => state.context.focus;

export const selectState = (state: RootState): State => state.context.state;

export default contextSlice.reducer;
