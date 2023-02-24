import React from 'react';
import type { TextareaProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Textarea: React.FC<FormControlType<string, TextareaProperty>> = ({
  value,
  property,
  onUpdateValue,
}) => {
  const { handle, placeholder, rows } = property;
  return (
    <BaseControl property={property}>
      <textarea
        id={handle}
        rows={rows}
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

export default Textarea;
