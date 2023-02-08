import React from 'react';

import { Control } from './control';
import type { ControlType } from './types';

const Int: React.FC<ControlType<number>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle } = property;

  return (
    <Control property={property}>
      <input
        id={handle}
        type="number"
        className="text fullwidth"
        value={(field.properties[handle] as string) ?? ''}
        onChange={(event) => updateValue(Number(event.target.value))}
      />
    </Control>
  );
};

export default Int;
