import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import React from 'react';

import { Control } from './control';
import { ControlType } from './types';

const Int: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid } = field;

  return (
    <Control field={field} property={property}>
      <input
        id={handle}
        type="number"
        className="text fullwidth"
        value={(field.properties[handle] as string) ?? ''}
        onChange={(event) =>
          dispatch(edit({ uid, property, value: Number(event.target.value) }))
        }
      />
    </Control>
  );
};

export default Int;
