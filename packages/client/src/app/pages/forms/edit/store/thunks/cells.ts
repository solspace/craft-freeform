import type { Cell, Row } from '@editor/builder/types/layout';
import { v4 } from 'uuid';

import type { AppDispatch, AppThunk } from '..';
import { contextSelectors } from '../slices/context/context.selectors';
import { cellActions } from '../slices/layout/cells';
import { rwoActions } from '../slices/layout/rows';

import { removeEmptyRows } from './rows';

export const moveExistingCellToNewRow =
  (cell: Cell, order?: number): AppThunk =>
  (dispatch, getState) => {
    const rowUid = v4();

    const state = getState();

    const currentPage = contextSelectors.currentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

    dispatch(
      rwoActions.add({
        layoutUid: currentPage.layoutUid,
        uid: rowUid,
        order,
      })
    );
    dispatch(
      cellActions.moveTo({
        uid: cell.uid,
        rowUid,
        position: 0,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };

export const moveExistingCellToExistingRow =
  (cell: Cell, row: Row, order: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const currentPage = contextSelectors.currentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

    dispatch(
      cellActions.moveTo({
        uid: cell.uid,
        rowUid: row.uid,
        position: order,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };
