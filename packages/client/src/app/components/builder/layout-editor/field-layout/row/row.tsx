import React from 'react';

import { Wrapper } from './row.styles';

type Props = {
  children?: React.ReactNode;
};

export const Row: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};
