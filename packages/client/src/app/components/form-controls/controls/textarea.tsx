import React from 'react';
import { modifySettings } from '@editor/store/slices/form';
import type { TextareaProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Textarea: React.FC<FormControlType<string, TextareaProperty>> = ({
  value,
  property,
  namespace,
  dispatch,
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
        defaultValue={value || ''}
        onChange={(event) =>
          dispatch(
            modifySettings({
              key: handle,
              namespace,
              value: event.target.value,
            })
          )
        }
      />
    </BaseControl>
  );
};

export default Textarea;
