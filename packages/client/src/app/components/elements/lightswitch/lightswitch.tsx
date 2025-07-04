import type { FC } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

import { LightSwitchHandle, LightSwitchWrapper } from './lightswitch.styles';

type Props = {
  enabled?: boolean;
  errors?: string[];
  onClick?: (enabled: boolean) => void;
};

export const LightSwitch: FC<Props> = ({ enabled, errors, onClick }) => {
  return (
    <LightSwitchWrapper
      className={classes(enabled && 'on', errors && 'error')}
      onClick={() => onClick?.(!enabled)}
    >
      <LightSwitchHandle />
    </LightSwitchWrapper>
  );
};
