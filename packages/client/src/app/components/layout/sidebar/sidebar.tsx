import type { PropsWithChildren } from 'react';
import React from 'react';

import type { WrapperProps } from './sidebar.styles';
import { Wrapper } from './sidebar.styles';

export const Sidebar: React.FC<PropsWithChildren<WrapperProps>> = ({
  children,
  ...props
}) => {
  return <Wrapper {...props}>{children}</Wrapper>;
};
