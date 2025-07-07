import type { FC } from 'react';
import React from 'react';
import config from '@config/freeform/freeform.config';
import classes from '@ff-client/utils/classes';

import { LightSwitchHandle, LightSwitchWrapper } from './lightswitch.styles';

type Props = {
  enabled?: boolean;
  errors?: string[];
  onClick?: (enabled: boolean) => void;
};

export const LightSwitch: FC<Props> = ({ enabled, errors, onClick }) => {
  const { is: craftVersion } = config.metadata.craft;

  return (
    <>
      <LightSwitchWrapper
        className={classes(
          enabled && 'on',
          errors && 'error',
          craftVersion.atLeast('5.8.0') && 'craft-5_8'
        )}
        onClick={() => onClick?.(!enabled)}
      >
        <LightSwitchHandle />
      </LightSwitchWrapper>
    </>
  );
};
