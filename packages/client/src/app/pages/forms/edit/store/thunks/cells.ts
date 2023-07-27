import { type Cell, type Row, CellType } from '@editor/builder/types/layout';
import { v4 } from 'uuid';

import type { AppDispatch, AppThunk } from '..';
import { fieldActions } from '../slices/fields';
import { cellActions } from '../slices/layout/cells';
import { layoutSelectors } from '../slices/layout/layouts/layouts.selectors';
import { rowActions } from '../slices/layout/rows';

import { removeEmptyRows } from './rows';

export const moveExistingCellToNewRow =
  (options: { cell: Cell; order?: number; layoutUid?: string }): AppThunk =>
  (dispatch, getState) => {
    const { cell, order } = options;
    let { layoutUid } = options;

    const rowUid = v4();

    if (!layoutUid) {
      layoutUid = layoutSelectors.currentPageLayout(getState())?.uid;
    }

    dispatch(
      rowActions.add({
        layoutUid,
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
    dispatch(cellActions.remove(cell.uid));
    if (cell.type === CellType.Field) {
      dispatch(fieldActions.remove(cell.targetUid));
    }

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };
