import React from 'react';
import classes from '@ff-client/utils/classes';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Int: React.FC<FormControlType<number>> = ({
  value,
  property,
  onUpdateValue,
}) => {
  const { handle, placeholder } = property;

  return (
    <BaseControl property={property}>
      <input
        id={handle}
        type="number"
        placeholder={placeholder}
        className={classes('text', 'fullwidth')}
        value={value.toString()}
        onChange={(event) => onUpdateValue(Number(event.target.value))}
      />
    </BaseControl>
  );
};

export default Int;
