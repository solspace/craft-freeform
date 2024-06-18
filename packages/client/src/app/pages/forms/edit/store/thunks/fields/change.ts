import type { AppThunk } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldActions } from '@editor/store/slices/layout/fields';
import type {
  FieldType,
  PropertyValueCollection,
} from '@ff-client/types/fields';

const changeFieldType =
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

export default {
  type: changeFieldType,
};
