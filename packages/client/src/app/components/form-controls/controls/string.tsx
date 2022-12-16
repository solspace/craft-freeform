import React from 'react';
import classes from '@ff-client/utils/classes';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const String: React.FC<FormControlType<string>> = ({
  value,
  property,
  onUpdateValue,
}) => {
  const { handle, placeholder } = property;

  return (
    <BaseControl property={property}>
      <input
        id={handle}
        type="text"
        placeholder={placeholder}
        className={classes(
          'text',
          'fullwidth',
          property.flags.includes('code') && 'code'
        )}
        value={value || ''}
        onChange={(event) => onUpdateValue(event.target.value)}
      />
    </BaseControl>
  );
};

export default String;
