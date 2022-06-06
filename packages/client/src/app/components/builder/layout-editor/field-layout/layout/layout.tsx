import React from 'react';

import { Wrapper } from './layout.styles';

type Props = {
  children?: React.ReactNode;
};

export const Layout: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};
