import React from 'react';
import { Wrapper } from './FieldContainer.styles';

export interface FieldContainerProps {
  description: string;
}

const FieldContainer: React.FC<FieldContainerProps> = ({ description, children }) => {
  return (
    <Wrapper>
      <div>{description}</div>
      <div>{children}</div>
    </Wrapper>
  );
};

export default FieldContainer;
