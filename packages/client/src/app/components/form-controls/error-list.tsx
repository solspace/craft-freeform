import React from 'react';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

type Props = {
  errors?: string[];
};

const ErrorList = styled.ul`
  list-style: square;

  margin-top: 5px;
  padding-left: 20px;

  color: ${colors.error};
`;

export const FormErrorList: React.FC<Props> = ({ errors }) => {
  if (!errors || !errors.length) {
    return null;
  }

  return (
    <ErrorList>
      {errors.map((error, idx) => (
        <li key={idx}>{error}</li>
      ))}
    </ErrorList>
  );
};
