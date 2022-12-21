import React from 'react';
import { Control } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/control';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import { MaxInput, MinInput, Wrapper } from './min-max.styles';

const MinMax: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle } = property;
  const { uid } = field;

  const [min, max] = field.properties[handle] || [null, null];
  const minValue = !field.properties.allowNegative ? 0 : null;

  // TODO - Validation of value before dispatch

  return (
    <Control property={property}>
      <Wrapper>
        <div>
          <MinInput
            id="min"
            value={min}
            type="number"
            min={minValue}
            className="text"
            placeholder="Min"
            onChange={({ target }) => {
              const value =
                target.value.length > 0 ? Number(target.value) : null;

              dispatch(
                edit({
                  uid,
                  property,
                  value: [value, max],
                })
              );
            }}
          />
        </div>
        <div>
          <MaxInput
            id="max"
            value={max}
            type="number"
            min={minValue}
            className="text"
            placeholder="Max"
            onChange={({ target }) => {
              const value =
                target.value.length > 0 ? Number(target.value) : null;

              dispatch(
                edit({
                  uid,
                  property,
                  value: [min, value],
                })
              );
            }}
          />
        </div>
      </Wrapper>
    </Control>
  );
};

export default MinMax;
