import type { Row } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk, RootState } from '@editor/store';
import { type Field, fieldActions } from '@editor/store/slices/layout/fields';
import { rowActions } from '@editor/store/slices/layout/rows';
import { Fields } from '@ff-client/types/field.classes';
import { v4 } from 'uuid';

export default (field: Field, row: Row): AppThunk =>
  (dispatch, getState) => {
    duplicateField(getState(), dispatch as AppDispatch, field, row);
  };

export const duplicateField = (
  state: RootState,
  dispatch: AppDispatch,
  field: Field,
  row: Row
): void => {
  if (field.typeClass === Fields.Group) {
    return;
  }

  const layoutUid = row.layoutUid;
  const rowUid = v4();

  dispatch(
    rowActions.add({
      layoutUid,
      uid: rowUid,
      order: row?.order,
    })
  );

  dispatch(
    fieldActions.duplicate({
      uid: v4(),
      rowUid,
      field: field,
    })
  );
};
