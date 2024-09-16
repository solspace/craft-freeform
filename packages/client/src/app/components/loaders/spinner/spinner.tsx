import React from 'react';

import SpinnerIcon from '../spinner.svg';

import { SpinnerContainer } from './spinner.styles';

type Props = {
  size?: number;
};

export const Spinner: React.FC<Props> = ({ size = 24 }) => {
  return (
    <SpinnerContainer
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <SpinnerIcon />
    </SpinnerContainer>
  );
};
