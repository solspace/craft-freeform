import config, { Edition } from '@config/freeform/freeform.config';
import type { Row } from '@editor/builder/types/layout';
import type { AppThunk } from '@editor/store';
import { fieldActions } from '@editor/store/slices/layout/fields';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { rowActions } from '@editor/store/slices/layout/rows';
import { type FieldType } from '@ff-client/types/fields';
import { v4 } from 'uuid';

const newRow =
  (options: {
    fieldType: FieldType;
    layoutUid?: string;
    row?: Row;
  }): AppThunk =>
  (dispatch, getState) => {
    if (config.editions.is(Edition.Express)) {
      if (getState().layout.fields.length >= config.limits.fields) {
        return;
      }
    }

    const { fieldType, row } = options;
    let { layoutUid } = options;

    if (!layoutUid) {
      const state = getState();
      if (row) {
        layoutUid = row.layoutUid;
      } else {
        layoutUid = layoutSelectors.currentPageLayout(state)?.uid;
      }
    }

    const fieldUid = v4();
    const rowUid = v4();

    dispatch(
      rowActions.add({
        layoutUid,
        uid: rowUid,
        order: row?.order,
      })
    );
    dispatch(fieldActions.add({ fieldType, uid: fieldUid, rowUid }));
  };

const existingRow =
  (options: { fieldType: FieldType; row: Row; order: number }): AppThunk =>
  (dispatch) => {
    const { fieldType, row, order } = options;
    const fieldUid = v4();

    dispatch(
      fieldActions.add({
        fieldType,
        uid: fieldUid,
        rowUid: row.uid,
        order,
      })
    );
  };

export default {
  newRow,
  existingRow,
};
