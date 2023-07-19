import type { Row } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';
import type { AppThunk } from '@editor/store';
import type { Field } from '@editor/store/slices/fields';
import { fieldActions } from '@editor/store/slices/fields';
import { cellActions } from '@editor/store/slices/layout/cells';
import type {
  FieldType,
  PropertyValueCollection,
} from '@ff-client/types/fields';
import { v4 } from 'uuid';

import { contextSelectors } from '../slices/context/context.selectors';
import { rowActions } from '../slices/layout/rows';

export const addNewFieldToNewRow =
  (fieldType: FieldType, row?: Row): AppThunk =>
  (dispatch, getState) => {
    const fieldUid = v4();
    const cellUid = v4();
    const rowUid = v4();

    const state = getState();

    const currentPage = contextSelectors.currentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

    dispatch(fieldActions.add({ fieldType, uid: fieldUid }));
    dispatch(
      rowActions.add({
        layoutUid: currentPage.layoutUid,
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
  (fieldType: FieldType, row: Row, order: number): AppThunk =>
  (dispatch, getState) => {
    const fieldUid = v4();
    const cellUid = v4();

    const state = getState();

    const currentPage = contextSelectors.currentPage(state);
    if (!currentPage) {
      throw new Error('No pages present');
    }

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
