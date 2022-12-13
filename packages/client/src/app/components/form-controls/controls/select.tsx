import React from 'react';
import { modifySettings } from '@editor/store/slices/form';
import type { SelectProperty } from '@ff-client/types/properties';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Select: React.FC<FormControlType<string, SelectProperty>> = ({
  value,
  property,
  namespace,
  dispatch,
}) => {
  const { options } = property;

  return (
    <BaseControl property={property}>
      <select
        id={property.handle}
        defaultValue={value}
        className="text fullwidth"
        onChange={(event) =>
          dispatch(
            modifySettings({
              key: property.handle,
              namespace,
              value: event.target.value,
            })
          )
        }
      >
        {options.map(({ value, label }, index) => (
          <option key={index} value={value} label={label} />
        ))}
      </select>
    </BaseControl>
  );
};

export default Select;
