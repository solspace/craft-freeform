import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';
import { LightSwitchInput } from '../inputs/lightswitch-input';

export const LightSwitch: React.FC<ControlProps<boolean>> = (
  props: ControlProps<boolean>
) => {
  const { id, value, onChange } = props;

  return (
    <Control {...props}>
      <LightSwitchInput
        id={id}
        enabled={value}
        onClick={() => onChange && onChange(!value)}
      />
    </Control>
  );
};
