import type { ComponentPropsWithRef } from 'react';
import React from 'react';
import { colors } from '@ff-client/styles/variables';
import { ErrorList } from '@ff-client/types/api';
import styled from 'styled-components';

type Props = ComponentPropsWithRef<'ul'> & {
  errors?: string[];
};

const ErrorList = styled.ul`
  list-style: square;

  margin-top: 5px;
  padding-left: 20px;

  color: ${colors.error};
`;

export const FormErrorList: React.FC<Props> = ({ errors, ...props }) => {
  if (!errors || !errors.length) {
    return null;
  }

  return (
    <ErrorList {...props}>
      {errors.map((error, idx) => (
        <li key={idx}>{error}</li>
      ))}
    </ErrorList>
  );
};
