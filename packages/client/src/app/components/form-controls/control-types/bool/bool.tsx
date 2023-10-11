import React from 'react';
import { ControlWrapper } from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import FormInstructions from '@components/form-controls/instructions';
import type { ControlType } from '@components/form-controls/types';
import type { BooleanProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import {
  CheckboxItem,
  CheckboxWrapper,
  LightSwitch,
  TextWrapper,
} from './bool.styles';

const Bool: React.FC<ControlType<BooleanProperty>> = ({
  value: enabled,
  property,
  errors,
  updateValue,
}) => {
  const { handle, label, width } = property;

  return (
    <ControlWrapper
      $width={width}
      className={classes(property.disabled && 'disabled')}
    >
      <CheckboxWrapper>
        <CheckboxItem>
          <LightSwitch
            className={classes(enabled && 'on')}
            onClick={() => updateValue(!enabled)}
          />
        </CheckboxItem>
        <TextWrapper onClick={() => updateValue(!enabled)}>
          <label htmlFor={handle}>{label}</label>
          <FormInstructions instructions={property.instructions} />
        </TextWrapper>
      </CheckboxWrapper>
      <FormErrorList errors={errors} />
    </ControlWrapper>
  );
};

export default Bool;
