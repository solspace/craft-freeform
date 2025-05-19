import React from 'react';
import { ControlBlock } from '@components/form-controls/control.block';
import {
  CheckboxItem,
  CheckboxWrapper,
  LightSwitch,
  TextWrapper,
} from '@components/form-controls/control-types/bool/bool.styles';
import FormInstructions from '@components/form-controls/instructions';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { InputControl } from '../template.modal.types';

export const BooleanInput: React.FC<InputControl> = (props) => {
  const { value, label, handle, instructions, onChange } = props;

  return (
    <ControlBlock {...props} label={undefined} instructions={undefined}>
      <CheckboxWrapper>
        <CheckboxItem>
          <LightSwitch
            className={classes(value && 'on')}
            onClick={() => onChange(!value)}
          />
        </CheckboxItem>
        <TextWrapper onClick={() => onChange(!value)}>
          <label htmlFor={handle}>{translate(label)}</label>
          <FormInstructions instructions={instructions} />
        </TextWrapper>
      </CheckboxWrapper>
    </ControlBlock>
  );
};
