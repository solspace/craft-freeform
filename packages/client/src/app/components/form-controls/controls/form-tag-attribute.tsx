import React from 'react';
import type { ControlProps } from '@components/form-controls/control';
import { Control } from '@components/form-controls/control';
import { FormTagAttributeInput } from '@components/form-controls/inputs/form-tag-attribute-input';
import type { Attribute } from '@ff-client/types/forms';

export const FormTagAttribute: React.FC<ControlProps<Attribute[]>> = ({
  id,
  value,
  label,
  onChange,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    <FormTagAttributeInput
      id={id}
      value={value || []}
      onChange={(value) => onChange && onChange(value)}
    />
  </Control>
);
