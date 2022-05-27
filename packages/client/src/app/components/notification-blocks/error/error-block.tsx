import React from 'react';
import { Wrapper } from './error-block.styles';

type Props = {
  children: React.ReactNode;
};

export const ErrorBlock: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};
