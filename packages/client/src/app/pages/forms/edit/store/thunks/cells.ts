import type { Cell, Row } from '@editor/builder/types/layout';
import { add as addRow } from '@editor/store/slices/rows';
import { v4 } from 'uuid';

import type { AppDispatch, AppThunk } from '..';
import { moveTo } from '../slices/cells';
import { selectCurrentPage } from '../slices/context';

import { removeEmptyRows } from './rows';

export const moveExistingCellToNewRow =
  (cell: Cell, order?: number): AppThunk =>
  (dispatch, getState) => {
    const rowUid = v4();

    const state = getState();

    const currentPage = selectCurrentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

    dispatch(
      addRow({
        layoutUid: currentPage.layoutUid,
        uid: rowUid,
        order,
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

export const moveExistingCellToExistingRow =
  (cell: Cell, row: Row, order: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const currentPage = selectCurrentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

    dispatch(
      moveTo({
        uid: cell.uid,
        rowUid: row.uid,
        position: order,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };
