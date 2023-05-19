import React from 'react';
import { useSelector } from 'react-redux';
import type { ControlType } from '@components/form-controls/types';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { useFieldTypeSearch } from '@ff-client/queries/field-types';
import type {
  FieldProperty,
  SelectProperty,
} from '@ff-client/types/properties';

import Select from '../select/select';

const Field: React.FC<ControlType<FieldProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const fields = useSelector(fieldSelectors.all);
  const findType = useFieldTypeSearch();

  (property as unknown as SelectProperty).options = fields
    .filter((field) => {
      if (!property.implements) {
        return true;
      }

      const type = findType(field.typeClass);
      if (!type) {
        return false;
      }

      return property.implements.every((implementation) =>
        type.implements?.includes(implementation)
      );
    })
    .map((field) => ({
      value: field.uid,
      label: field.properties.label,
    }));

  return (
    <Select
      property={property as unknown as SelectProperty}
      updateValue={updateValue}
      value={value}
      errors={errors}
    />
  );
};

export default Field;
