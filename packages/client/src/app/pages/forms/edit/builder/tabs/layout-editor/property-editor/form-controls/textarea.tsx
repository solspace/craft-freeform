import React from 'react';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import classes from '@ff-client/utils/classes';

import { Control } from './control';
import type { ControlType } from './types';

const Textarea: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid, properties } = field;

  return (
    <Control field={field} property={property}>
      <textarea
        id={handle}
        className={classes(
          'text',
          'fullwidth',
          property.flags.includes('code') && 'code'
        )}
        rows={2}
        value={(properties[handle] as string) ?? ''}
        placeholder={property.placeholder}
        onChange={(event) =>
          dispatch(edit({ uid, property, value: event.target.value }))
        }
      />
    </Control>
  );
};

export default Textarea;
