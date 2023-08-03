import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { IntegerProperty } from '@ff-client/types/properties';

const Int: React.FC<ControlType<IntegerProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
}) => {
  const { handle, min, max } = property;

  const onBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    let newValue = Number(event.target.value);

    if (min !== null) {
      newValue = Math.max(newValue, min);
    }

    if (max !== null) {
      newValue = Math.min(newValue, max);
    }

    updateValue(newValue);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateValue(Number(event.target.value));
  };

  return (
    <Control property={property} errors={errors}>
      <input
        id={handle}
        type="number"
        className="text fullwidth"
        value={value === undefined || value === null ? '' : value}
        autoFocus={autoFocus}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Control>
  );
};

export default Int;
