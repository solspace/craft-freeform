import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import classes from '@ff-client/utils/classes';

const String: React.FC<ControlType<string>> = ({
  value,
  property,
  updateValue,
}) => {
  const { handle } = property;

  return (
    <Control property={property}>
      <input
        id={handle}
        type="text"
        className={classes(
          'text',
          'fullwidth',
          property.flags.includes('code') && 'code'
        )}
        value={value ?? ''}
        placeholder={property.placeholder}
        onChange={(event) => updateValue(event.target.value)}
      />
    </Control>
  );
};

export default String;
