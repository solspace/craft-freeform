import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { TextareaProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

const Textarea: React.FC<ControlType<TextareaProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
}) => {
  const { handle, rows } = property;

  return (
    <Control property={property} errors={errors}>
      <textarea
        id={handle}
        className={classes(
          'text',
          'fullwidth',
          property.flags.includes('as-readonly-in-instance') && 'readonly',
          property.flags.includes('code') && 'code'
        )}
        readOnly={property.flags.includes('as-readonly-in-instance')}
        rows={rows}
        value={value ?? ''}
        placeholder={property.placeholder}
        autoFocus={autoFocus}
        onChange={(event) => updateValue(event.target.value)}
      />
    </Control>
  );
};

export default Textarea;
