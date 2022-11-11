import React from 'react';
import type { ControlProps } from '@components/form-controls/control';
import { Control } from '@components/form-controls/control';
import { FormTagAttributeInput } from '@components/form-controls/inputs/form-tag-attribute-input';
import type { FormTagAttributeProps } from '@ff-client/types/properties';

export const FormTagAttribute: React.FC<
  ControlProps<FormTagAttributeProps[]>
> = ({ id, value, label, onChange, instructions }) => (
  <Control id={id} label={label} instructions={instructions}>
    <FormTagAttributeInput
      id={id}
      value={value || []}
      onChange={(value) => onChange && onChange(value)}
    />
  </Control>
);
