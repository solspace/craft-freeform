import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';

const Int: React.FC<ControlType<number>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { handle } = property;

  return (
    <Control property={property} errors={errors}>
      <input
        id={handle}
        type="number"
        className="text fullwidth"
        value={value || ''}
        onChange={(event) => updateValue(Number(event.target.value))}
      />
    </Control>
  );
};

export default Int;
