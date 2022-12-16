import React from 'react';
import { FormTagAttributeInput } from '@components/form-controls/inputs/form-tag-attribute-input';
import type { Attribute } from '@ff-client/types/forms';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

export const FormTagAttribute: React.FC<FormControlType<Attribute[]>> = ({
  value,
  property,
  onUpdateValue,
}) => {
  const { handle } = property;

  return (
    <BaseControl property={property}>
      <FormTagAttributeInput
        id={handle}
        value={value || []}
        onChange={onUpdateValue}
      />
    </BaseControl>
  );
};
