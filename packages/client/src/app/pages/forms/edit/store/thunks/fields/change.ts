import type { AppThunk } from "@editor/store";
import type { Field } from "@editor/store/slices/layout/fields";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { uniqueFieldHandle } from "@editor/store/slices/layout/fields/unique-handle";
import { Fields } from "@ff-client/types/field.classes";
import type {
  FieldType,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import camelCase from "lodash/camelCase";
import { initializeContainer } from "./containers";

const changeFieldType =
  (field: Field, type: FieldType): AppThunk =>
  (dispatch, getState) => {
    const { uid } = field;

    const properties: PropertyValueCollection = {};

    type.properties.forEach((property) => {
      const targetProperty = field.properties[property.handle];

      if (targetProperty !== undefined) {
        properties[property.handle] = targetProperty;
      } else {
        properties[property.handle] = property.value;
      }
    });
    if (field.typeClass === Fields.Content) {
      const count = getState().layout.fields.filter(
        (item) => item.typeClass === type.typeClass,
      ).length;
      properties.label = type.name + (count ? ` ${count}` : "");
      properties.handle = uniqueFieldHandle(
        getState().layout.fields,
        camelCase(properties.label),
        uid,
      );
    }

    dispatch(
      fieldActions.batchEdit({
        uid,
        typeClass: type.typeClass,
        properties,
      }),
    );
    dispatch(initializeContainer(uid));
  };

export default {
  type: changeFieldType,
};
