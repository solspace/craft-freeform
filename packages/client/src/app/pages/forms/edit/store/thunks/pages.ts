import type { Cell, Page } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk } from '@editor/store';
import { add as addLayout } from '@editor/store/slices/layouts';
import { add as addPage } from '@editor/store/slices/pages';
import { add as addRow } from '@editor/store/slices/rows';
import { v4 } from 'uuid';

import { moveTo } from '../slices/cells';

import { removeEmptyRows } from './rows';

export const addNewPage = (): AppThunk => (dispatch, getState) => {
  const pageUid = v4();
  const layoutUid = v4();

  const state = getState();

  const totalPages = state.pages.length;
  const nextPageNumber = totalPages + 1;

  dispatch(addLayout({ uid: layoutUid }));
  dispatch(
    addPage({
      uid: pageUid,
      label: `Page ${nextPageNumber}`,
      layoutUid,
    })
  );
};

export const moveCellToPage =
  (cell: Cell, page: Page): AppThunk =>
  (dispatch, getState) => {
    const { layoutUid } = page;

    const rowUid = v4();

    dispatch(
      addRow({
        layoutUid,
        uid: rowUid,
      })
    );
    dispatch(
      moveTo({
        uid: cell.uid,
        rowUid,
        position: 0,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };
