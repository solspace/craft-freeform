import type { AppDispatch, AppThunk, RootState } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldActions } from '@editor/store/slices/layout/fields';
import { layoutActions } from '@editor/store/slices/layout/layouts';
import { rowActions } from '@editor/store/slices/layout/rows';
import { Fields } from '@ff-client/types/field.classes';

import { removeEmptyRows } from '../rows';

export default (field: Field): AppThunk =>
  (dispatch, getState) => {
    removeField(getState(), dispatch as AppDispatch, field);
    removeEmptyRows(getState(), dispatch as AppDispatch);
  };

export const removeField = (
  state: RootState,
  dispatch: AppDispatch,
  field: Field
): void => {
  if (field.typeClass === Fields.Group) {
    const layout = state.layout.layouts.find(
      (layout) => layout.uid === field.properties.layout
    );

    if (!layout) {
      return;
    }

    const rows = state.layout.rows.filter(
      (row) => row.layoutUid === layout.uid
    );

    rows.forEach((row) => {
      const fields = state.layout.fields.filter(
        (field) => field.rowUid === row.uid
      );

      fields.forEach((rowField) => {
        removeField(state, dispatch, rowField);
      });

      dispatch(rowActions.remove(row.uid));
    });

    dispatch(layoutActions.remove(layout.uid));
  }

  dispatch(fieldActions.remove(field.uid));
};
