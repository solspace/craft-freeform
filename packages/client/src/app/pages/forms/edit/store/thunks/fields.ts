import type { Row } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';
import type { AppThunk } from '@editor/store';
import type { Field } from '@editor/store/slices/fields';
import { fieldActions } from '@editor/store/slices/fields';
import { cellActions } from '@editor/store/slices/layout/cells';
import {
  type FieldType,
  type PropertyValueCollection,
} from '@ff-client/types/fields';
import { v4 } from 'uuid';

import { layoutSelectors } from '../slices/layout/layouts/layouts.selectors';
import { rowActions } from '../slices/layout/rows';

export const addNewFieldToNewRow =
  (options: {
    fieldType: FieldType;
    layoutUid?: string;
    row?: Row;
  }): AppThunk =>
  (dispatch, getState) => {
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
    const cellUid = v4();
    const rowUid = v4();

    dispatch(fieldActions.add({ fieldType, uid: fieldUid }));
    dispatch(
      rowActions.add({
        layoutUid,
        uid: rowUid,
        order: row?.order,
      })
    );
    dispatch(
      cellActions.add({
        type: CellType.Field,
        rowUid,
        targetUid: fieldUid,
        uid: cellUid,
      })
    );
  };

export const addNewFieldToExistingRow =
  (options: { fieldType: FieldType; row: Row; order: number }): AppThunk =>
  (dispatch) => {
    const { fieldType, row, order } = options;

    const fieldUid = v4();
    const cellUid = v4();

    dispatch(fieldActions.add({ fieldType, uid: fieldUid }));
    dispatch(
      cellActions.add({
        type: CellType.Field,
        rowUid: row.uid,
        targetUid: fieldUid,
        uid: cellUid,
        order,
      })
    );
  };

export const changeFieldType =
  (field: Field, type: FieldType): AppThunk =>
  (dispatch) => {
    const { uid } = field;

    const properties: PropertyValueCollection = {};

    type.properties.forEach((property) => {
      const targetProperty = field.properties[property.handle];

      if (targetProperty) {
        properties[property.handle] = targetProperty;
      } else {
        properties[property.handle] = property.value;
      }
    });

    dispatch(
      fieldActions.batchEdit({
        uid,
        typeClass: type.typeClass,
        properties,
      })
    );
  };
