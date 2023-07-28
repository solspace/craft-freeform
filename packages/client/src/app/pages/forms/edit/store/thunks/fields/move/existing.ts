import type { Row } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldActions } from '@editor/store/slices/layout/fields';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { rowActions } from '@editor/store/slices/layout/rows';
import { v4 } from 'uuid';

import { removeEmptyRows } from '../../rows';

const newRow =
  (options: { field: Field; order?: number; layoutUid?: string }): AppThunk =>
  (dispatch, getState) => {
    const { field, order } = options;
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
      fieldActions.moveTo({
        uid: field.uid,
        rowUid,
        position: 0,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };

const existingRow =
  (field: Field, row: Row, order: number): AppThunk =>
  (dispatch, getState) => {
    dispatch(
      fieldActions.moveTo({
        uid: field.uid,
        rowUid: row.uid,
        position: order,
      })
    );

    removeEmptyRows(getState(), dispatch as AppDispatch);
  };

export default {
  newRow,
  existingRow,
};
