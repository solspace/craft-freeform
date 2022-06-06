import React from 'react';

import { Wrapper } from './pages.styles';

type Props = {
  children?: React.ReactNode;
};

export const Page: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};
