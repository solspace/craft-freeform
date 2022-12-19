import React from 'react';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import MinMaxValues from './custom/min-max-values';
import { Control } from './control';
import { CustomControlType } from './enums';
import type { ControlType } from './types';

const Array: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid } = field;

  const value = field.properties[handle];
  const { allowNegative } = field.properties;

  return (
    <Control property={property}>
      {handle === CustomControlType.MinMaxValues && (
        <MinMaxValues
          value={value}
          allowNegative={allowNegative}
          onChange={(value) =>
            dispatch(
              edit({
                uid,
                property,
                value,
              })
            )
          }
        />
      )}
    </Control>
  );
};

export default Array;
