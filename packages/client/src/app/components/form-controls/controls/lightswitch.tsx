import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';
import { LightSwitchInput } from '../inputs/lightswitch-input';

export const LightSwitch: React.FC<ControlProps<boolean>> = ({
  id,
  value,
  label,
  onChange,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    <LightSwitchInput
      id={id}
      enabled={value}
      onClick={() => onChange && onChange(!value)}
    />
  </Control>
);
