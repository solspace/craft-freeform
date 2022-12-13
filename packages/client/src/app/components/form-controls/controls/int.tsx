import React from 'react';
import { modifySettings } from '@editor/store/slices/form';
import classes from '@ff-client/utils/classes';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Int: React.FC<FormControlType<number>> = ({
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
        type="number"
        placeholder={placeholder}
        className={classes('text', 'fullwidth')}
        defaultValue={value.toString()}
        onChange={(event) =>
          dispatch(
            modifySettings({
              key: handle,
              namespace,
              value: Number(event.target.value),
            })
          )
        }
      />
    </BaseControl>
  );
};

export default Int;
