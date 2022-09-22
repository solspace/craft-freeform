import React from 'react';
import { Control, ControlProps } from '../control';
import { Handle, Wrapper } from './lightswitch.styles';

export const Lightswitch: React.FC<ControlProps<boolean>> = (props) => {
  const { value, onChange } = props;

  return (
    <Control {...props}>
      <Wrapper
        enabled={value}
        onClick={(): void => onChange && onChange(!value)}
      >
        <Handle />
      </Wrapper>
    </Control>
  );
};
