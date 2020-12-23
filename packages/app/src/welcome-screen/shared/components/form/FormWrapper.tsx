import React from 'react';
import { Wrapper } from './FormWrapper.styles';

const FormWrapper: React.FC = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default FormWrapper;
