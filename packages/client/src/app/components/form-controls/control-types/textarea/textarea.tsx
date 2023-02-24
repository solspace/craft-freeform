import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import classes from '@ff-client/utils/classes';

const Textarea: React.FC<ControlType<string>> = ({
  value,
  property,
  updateValue,
}) => {
  const { handle } = property;

  return (
    <Control property={property}>
      <textarea
        id={handle}
        className={classes(
          'text',
          'fullwidth',
          property.flags.includes('code') && 'code'
        )}
        rows={2}
        value={value ?? ''}
        placeholder={property.placeholder}
        onChange={(event) => updateValue(event.target.value)}
      />
    </Control>
  );
};

export default Textarea;
