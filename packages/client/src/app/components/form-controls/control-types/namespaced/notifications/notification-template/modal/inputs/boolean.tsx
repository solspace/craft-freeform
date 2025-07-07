import type { FC } from 'react';
import React from 'react';
import { LightSwitch } from '@components/elements/lightswitch/lightswitch';
import { ControlBlock } from '@components/form-controls/control.block';
import {
  CheckboxItem,
  CheckboxWrapper,
  TextWrapper,
} from '@components/form-controls/control-types/bool/bool.styles';
import FormInstructions from '@components/form-controls/instructions';
import translate from '@ff-client/utils/translations';

import type { InputControl } from '../template.modal.types';

export const BooleanInput: FC<InputControl> = (props) => {
  const { value, label, handle, instructions, onChange } = props;

  return (
    <ControlBlock {...props} label={undefined} instructions={undefined}>
      <CheckboxWrapper>
        <CheckboxItem>
          <LightSwitch
            enabled={value}
            onClick={(enabled) => onChange(enabled)}
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
