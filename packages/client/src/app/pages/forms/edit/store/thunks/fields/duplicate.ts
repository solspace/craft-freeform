import type { Row } from '@editor/builder/types/layout';
import type { AppDispatch, AppThunk, RootState } from '@editor/store';
import { type Field, fieldActions } from '@editor/store/slices/layout/fields';
import { layoutActions } from '@editor/store/slices/layout/layouts';
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
  const layoutUid = row.layoutUid;
  const rowUid = v4();

  if (field.typeClass === Fields.Group) {
    const groupLayoutUid = field.properties.layout as string;
    const newLayoutUid = v4();

    // Create a new layout entry for the duplicate group
    const originalLayout = state.layout.layouts.find(
      (layout) => layout.uid === groupLayoutUid
    );

    if (originalLayout) {
      dispatch(
        layoutActions.add({
          ...originalLayout,
          uid: newLayoutUid,
        })
      );
    }

    // Grab all rows and fields and add them to the new layout UID
    const groupRows = state.layout.rows
      .filter((row) => row.layoutUid === groupLayoutUid)
      .sort((a, b) => a.order - b.order);

    for (const groupRow of groupRows) {
      const newGroupRowUid = v4();
      dispatch(
        rowActions.add({
          layoutUid: newLayoutUid,
          uid: newGroupRowUid,
        })
      );

      state.layout.fields
        .filter((field) => field.rowUid === groupRow.uid)
        .forEach((groupField) => {
          dispatch(
            fieldActions.duplicate({
              uid: v4(),
              rowUid: newGroupRowUid,
              field: groupField,
            })
          );
        });
    }

    // Duplicate the group field, but add it to the new layout we created above
    dispatch(
      rowActions.add({
        layoutUid,
        uid: rowUid,
        order: row?.order + 1,
      })
    );

    dispatch(
      fieldActions.duplicate({
        uid: v4(),
        rowUid,
        field: {
          ...field,
          properties: {
            ...field.properties,
            layout: newLayoutUid,
          },
        },
      })
    );

    return;
  }

  dispatch(
    rowActions.add({
      layoutUid,
      uid: rowUid,
      order: row?.order + 1,
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
