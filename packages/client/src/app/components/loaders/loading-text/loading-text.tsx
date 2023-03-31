import type { ComponentPropsWithRef } from 'react';
import React from 'react';

import { Dot, LoadingTextWrapper } from './loading-text.styles';
import SpinnerIcon from './spinner.svg';

type Props = ComponentPropsWithRef<'div'>;

export const LoadingText: React.FC<Props> = ({ children, ...props }) => {
  return (
    <LoadingTextWrapper {...props}>
      <SpinnerIcon />
      {children}
      <Dot />
      <Dot />
      <Dot />
      <Dot />
    </LoadingTextWrapper>
  );
};
