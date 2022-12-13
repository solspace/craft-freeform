import React from 'react';
import { modifySettings } from '@editor/store/slices/form';
import classes from '@ff-client/utils/classes';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const String: React.FC<FormControlType<string>> = ({
  value,
  property,
  namespace,
  dispatch,
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
        defaultValue={value}
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

export default String;
