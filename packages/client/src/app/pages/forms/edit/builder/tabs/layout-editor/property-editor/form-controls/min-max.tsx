import React from 'react';
import { Control } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/control';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';

import { MaxInput, MinInput, Wrapper } from './min-max.styles';

const MinMax: React.FC<ControlType<[number, number]>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle } = property;

  const [min, max] = field.properties[handle] || [null, null];
  const minValue = !field.properties?.allowNegative ? 0 : null;

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
