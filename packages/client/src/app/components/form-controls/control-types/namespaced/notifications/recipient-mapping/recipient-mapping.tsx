import React from 'react';
import { useSelector } from 'react-redux';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { selectField } from '@editor/store/slices/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import type { Notification } from '@ff-client/types/notifications';
import { RecipientMapping } from '@ff-client/types/notifications';

import { RecipientMappingBlock } from './block/block';

const RecipientMapping: React.FC<
  ControlType<RecipientMapping[], Notification>
> = ({ value, property, errors, updateValue, context }) => {
  const fieldUid = context.field as string;
  const field = useSelector(selectField(fieldUid));
  const fieldType = useFieldType(field?.typeClass);

  return (
    <Control property={property} errors={errors}>
      {!!value &&
        value.map((mapping, idx) => (
          <RecipientMappingBlock
            key={idx}
            mapping={mapping}
            onChange={(newValue) => {
              updateValue([
                ...value.slice(0, idx),
                newValue,
                ...value.slice(idx + 1),
              ]);
            }}
          />
        ))}
      <br />

      {!!field && field.typeClass}
    </Control>
  );
};

export default RecipientMapping;
