import React from 'react';
import { FormComponent } from '@components/form-controls';
import type { ControlType } from '@components/form-controls/types';
import { useAppDispatch } from '@editor/store';
import type { Field } from '@editor/store/slices/layout/fields';
import { fieldThunks } from '@editor/store/thunks/fields';
import {
  useFetchFieldTypes,
  useFieldTypeSearch,
} from '@ff-client/queries/field-types';
import type { FieldTypeProperty } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

const FieldType: React.FC<ControlType<FieldTypeProperty>> = ({
  property,
  context,
}) => {
  const dispatch = useAppDispatch();
  const searchFieldType = useFieldTypeSearch();
  const { data: types } = useFetchFieldTypes();
  const field = context as Field;

  return (
    <FormComponent
      value={field.typeClass}
      property={{
        type: PropertyType.Select,
        handle: 'typeClass',
        label: translate(property.label),
        instructions: translate(property.instructions),
        options: types.map((type) => ({
          label: type.name,
          value: type.typeClass,
        })),
      }}
      updateValue={(value) => {
        if (
          !confirm(
            translate(
              'Are you sure? You might potentially lose important data.'
            )
          )
        ) {
          return;
        }

        dispatch(
          fieldThunks.change.type(field, searchFieldType(value as string))
        );
      }}
    />
  );
};

export default FieldType;
