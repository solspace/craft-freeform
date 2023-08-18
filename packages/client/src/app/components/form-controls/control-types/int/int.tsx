import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { IntegerProperty } from '@ff-client/types/properties';
import { parseNumericValue } from '@ff-client/utils/numbers';

const Int: React.FC<ControlType<IntegerProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
}) => {
  const { handle, min, max, unsigned, step = 1 } = property;

  const onBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    updateValue(parseNumericValue(event.target.value, { min, max, unsigned }));
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateValue(parseNumericValue(event.target.value));
  };

  return (
    <Control property={property} errors={errors}>
      <input
        id={handle}
        type="number"
        className="text fullwidth"
        value={value === undefined || value === null ? '' : value}
        autoFocus={autoFocus}
        step={step}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Control>
  );
};

export default Int;
