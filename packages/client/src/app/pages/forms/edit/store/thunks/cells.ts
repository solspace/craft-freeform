import { type Cell, type Row, CellType } from '@editor/builder/types/layout';
import { v4 } from 'uuid';

import type { AppDispatch, AppThunk } from '..';
import { contextSelectors } from '../slices/context/context.selectors';
import { fieldActions } from '../slices/fields';
import { cellActions } from '../slices/layout/cells';
import { rowActions } from '../slices/layout/rows';

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
      rowActions.add({
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

export const removeCell =
  (cell: Cell): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    dispatch(cellActions.remove(cell.uid));
    if (cell.type === CellType.Field) {
      dispatch(fieldActions.remove(cell.targetUid));
    }

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };
