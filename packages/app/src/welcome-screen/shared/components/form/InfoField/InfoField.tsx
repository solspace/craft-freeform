import React, { PropsWithChildren } from 'react';
import { Wrapper } from '../FieldContainer/FieldContainer.styles';

const InfoField: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Wrapper>
      <div>{children}</div>
    </Wrapper>
  );
};

export default InfoField;
