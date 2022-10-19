import React from 'react';

import { Control, ControlProps } from '../control';
import { LightswitchInput } from '../inputs/lightswitch-input';

export const Lightswitch: React.FC<ControlProps<boolean>> = (props) => {
  const { value, onChange } = props;

  return (
    <Control {...props}>
      <LightswitchInput
        enabled={value}
        onClick={() => onChange && onChange(!value)}
      />
    </Control>
  );
};
