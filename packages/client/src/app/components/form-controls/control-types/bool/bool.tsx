import React from 'react';
import { ControlWrapper } from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import type { ControlType } from '@components/form-controls/types';
import type { BooleanProperty } from '@ff-client/types/properties';

import { CheckboxWrapper } from './bool.styles';

const Bool: React.FC<ControlType<BooleanProperty>> = ({
  value: enabled,
  property,
  errors,
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
      <FormErrorList errors={errors} />
    </ControlWrapper>
  );
};

export default Bool;
