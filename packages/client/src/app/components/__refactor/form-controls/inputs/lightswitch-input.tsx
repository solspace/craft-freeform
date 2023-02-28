import React from 'react';

import { Handle, Wrapper } from './lightswitch-input.styles';

type Props = {
  id?: string;
  enabled: boolean;
  onClick?: (value: boolean) => void;
};

export const LightSwitchInput: React.FC<Props> = ({ enabled, onClick }) => (
  <Wrapper enabled={enabled} onClick={() => onClick && onClick(!enabled)}>
    <Handle />
  </Wrapper>
);
