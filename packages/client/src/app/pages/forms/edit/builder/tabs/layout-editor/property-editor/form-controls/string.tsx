import React from 'react';
import classes from '@ff-client/utils/classes';

import { Control } from './control';
import type { ControlType } from './types';

const String: React.FC<ControlType<string>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle } = property;
  const { properties } = field;

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
        value={(properties[handle] as string) ?? ''}
        placeholder={property.placeholder}
        onChange={(event) => updateValue(event.target.value)}
      />
    </Control>
  );
};

export default String;
