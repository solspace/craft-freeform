import config, { Edition } from "@config/freeform/freeform.config";
import { isComponentType } from "@editor/builder/tabs/layout/field-list/catalog/components/component.presets";
import type { Row } from "@editor/builder/types/layout";
import type { AppThunk } from "@editor/store";
import { contextActions, FocusType } from "@editor/store/slices/context";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { layoutSelectors } from "@editor/store/slices/layout/layouts/layouts.selectors";
import { rowActions } from "@editor/store/slices/layout/rows";
import type { FieldType } from "@ff-client/types/fields";
import { v4 } from "uuid";
import { populateComponent, validComponent } from "../components";
import { canPlaceField, initializeContainer } from "../containers";

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

    if (
      !layoutUid ||
      !canPlaceField(getState(), fieldType, layoutUid) ||
      !validComponent(fieldType)
    )
      return;
    const fieldUid = v4();
    const rowUid = v4();

    dispatch(
      rowActions.add({
        layoutUid,
        uid: rowUid,
        order: row?.order,
      }),
    );
    dispatch(fieldActions.add({ fieldType, uid: fieldUid, rowUid }));
    if (isComponentType(fieldType))
      populateComponent(dispatch, getState, fieldUid, fieldType);
    else dispatch(initializeContainer(fieldUid));
    dispatch(
      contextActions.setFocusedItem({ type: FocusType.Field, uid: fieldUid }),
    );
  };

const existingRow =
  (options: { fieldType: FieldType; row: Row; order: number }): AppThunk =>
  (dispatch, getState) => {
    const { fieldType, row, order } = options;
    if (
      !canPlaceField(getState(), fieldType, row.layoutUid) ||
      !validComponent(fieldType)
    )
      return;
    if (
      config.editions.is(Edition.Express) &&
      getState().layout.fields.length >= config.limits.fields
    )
      return;
    const fieldUid = v4();

    dispatch(
      fieldActions.add({
        fieldType,
        uid: fieldUid,
        rowUid: row.uid,
        order,
      }),
    );
    if (isComponentType(fieldType))
      populateComponent(dispatch, getState, fieldUid, fieldType);
    else dispatch(initializeContainer(fieldUid));
    dispatch(
      contextActions.setFocusedItem({ type: FocusType.Field, uid: fieldUid }),
    );
  };

export default {
  newRow,
  existingRow,
};
