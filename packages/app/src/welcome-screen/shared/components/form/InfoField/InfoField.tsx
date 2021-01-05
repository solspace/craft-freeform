import React from 'react';
import { Wrapper } from '../FieldContainer/FieldContainer.styles';

const InfoField: React.FC = ({ children }) => {
  return (
    <Wrapper>
      <div>{children}</div>
    </Wrapper>
  );
};

export default InfoField;
