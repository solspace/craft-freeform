import React from 'react';
import { useSelector } from 'react-redux';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import { selectField } from '@editor/store/slices/fields';
import { useQueryNotificationTemplates } from '@ff-client/queries/notifications';
import type { Notification } from '@ff-client/types/notifications';
import { RecipientMapping } from '@ff-client/types/notifications';
import { PropertyType } from '@ff-client/types/properties';

import { RecipientMappingBlock } from './block/block';

const CUSTOM_OPTIONS = [PropertyType.Select];

const RecipientMapping: React.FC<
  ControlType<RecipientMapping[], Notification>
> = ({ value, property, errors, updateValue, context }) => {
  const { data, isFetching } = useQueryNotificationTemplates();

  const fieldUid = context.field as string;
  const field = useSelector(selectField(fieldUid));

  console.log(value);

  return (
    <Control property={property} errors={errors}>
      {!!value &&
        value.map((mapping, idx) => <li key={idx}>{mapping.value}</li>)}

      <RecipientMappingBlock />
      <RecipientMappingBlock />
      <RecipientMappingBlock />

      <input
        className="text fullwidth"
        defaultValue={!!field && field.typeClass}
      />
    </Control>
  );
};

export default RecipientMapping;
