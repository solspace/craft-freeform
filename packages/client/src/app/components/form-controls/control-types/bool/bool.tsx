import React from 'react';
import { CheckboxInput } from '@components/__refactor/form-controls/inputs/checkbox-input';
import { ControlWrapper } from '@components/form-controls/control.styles';
import type { ControlType } from '@components/form-controls/types';

import { CheckboxWrapper } from './bool.styles';

const Bool: React.FC<ControlType<boolean>> = ({
  value: enabled,
  property,
  updateValue,
}) => {
  const { handle, label } = property;

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
