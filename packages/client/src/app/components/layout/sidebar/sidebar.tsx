import React, { PropsWithChildren } from 'react';
import { Wrapper, WrapperProps } from './sidebar.styles';

export const Sidebar: React.FC<PropsWithChildren<WrapperProps>> = ({
  children,
  ...props
}) => {
  return <Wrapper {...props}>{children}</Wrapper>;
};
