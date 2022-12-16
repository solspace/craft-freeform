import React from 'react';

import { LightSwitchInput } from '../inputs/lightswitch-input';
import { InputWrapper } from '../inputs/lightswitch-input.styles';
import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Bool: React.FC<FormControlType<boolean>> = ({
  value,
  property,
  onUpdateValue,
}) => (
  <BaseControl property={property}>
    <InputWrapper>
      <LightSwitchInput
        id={property.handle}
        enabled={value}
        onClick={() => onUpdateValue(!value)}
      />
    </InputWrapper>
  </BaseControl>
);

export default Bool;
