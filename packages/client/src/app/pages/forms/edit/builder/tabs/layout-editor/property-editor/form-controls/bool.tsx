import React from 'react';
import { CheckboxInput } from '@ff-client/app/components/form-controls/inputs/checkbox-input';

import { CheckboxWrapper } from './bool.styles';
import { ControlWrapper } from './control.styles';
import type { ControlType } from './types';

const Bool: React.FC<ControlType<boolean>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle, label } = property;
  const { properties } = field;

  const enabled = (properties[handle] as boolean) ?? false;

  return (
    <ControlWrapper>
      <CheckboxWrapper>
        <CheckboxInput
          id={handle}
          label={label}
          checked={enabled}
          onChange={() => updateValue(!enabled)}
        />
      </CheckboxWrapper>
    </ControlWrapper>
  );
};

export default Bool;
