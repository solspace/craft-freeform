import React, { PropsWithChildren } from 'react';
import { Wrapper } from './FormWrapper.styles';

const FormWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default FormWrapper;
