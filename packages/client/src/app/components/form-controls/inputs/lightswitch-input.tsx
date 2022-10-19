import React from 'react';

import { Handle, Wrapper } from './lightswitch.styles';

type Props = {
  enabled: boolean;
  onClick?: (value: boolean) => void;
};

export const LightswitchInput: React.FC<Props> = ({ enabled, onClick }) => {
  return (
    <Wrapper enabled={enabled} onClick={() => onClick && onClick(!enabled)}>
      <Handle />
    </Wrapper>
  );
};
