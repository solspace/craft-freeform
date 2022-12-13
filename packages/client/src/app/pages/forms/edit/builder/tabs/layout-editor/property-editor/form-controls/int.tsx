import React from 'react';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import { Control } from './control';
import type { ControlType } from './types';

const Int: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid } = field;

  return (
    <Control property={property}>
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
