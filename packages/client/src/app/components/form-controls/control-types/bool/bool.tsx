import React from 'react';
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
        <input
          id={handle}
          type="checkbox"
          checked={enabled}
          className="checkbox"
          onChange={() => updateValue(!enabled)}
        />
        <label htmlFor={handle}>{label}</label>
      </CheckboxWrapper>
    </ControlWrapper>
  );
};

export default Bool;
