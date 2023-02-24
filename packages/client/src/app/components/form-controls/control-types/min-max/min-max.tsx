import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { Field } from '@editor/store/slices/fields';

import { MaxInput, MinInput, Wrapper } from './min-max.styles';

const MinMax: React.FC<ControlType<[number, number], Field>> = ({
  value,
  property,
  updateValue,
  context,
}) => {
  const [min, max] = value || [null, null];
  const minValue = !context.properties?.allowNegative ? 0 : null;

  return (
    <Control property={property}>
      <Wrapper>
        <div>
          <MinInput
            id="min"
            value={min === null ? '' : min}
            type="number"
            min={minValue}
            className="text"
            placeholder="Min"
            onChange={({ target }) => {
              const value = target.value !== '' ? Number(target.value) : null;

              updateValue([value, max]);
            }}
          />
        </div>
        <div>
          <MaxInput
            id="max"
            value={max === null ? '' : max}
            type="number"
            min={minValue}
            className="text"
            placeholder="Max"
            onChange={({ target }) => {
              const value = target.value !== '' ? Number(target.value) : null;

              updateValue([min, value]);
            }}
          />
        </div>
      </Wrapper>
    </Control>
  );
};

export default MinMax;
