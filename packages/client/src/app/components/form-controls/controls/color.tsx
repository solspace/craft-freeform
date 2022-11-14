import React from 'react';
import styled from 'styled-components';

import type { ControlProps } from '../control';
import { Control } from '../control';

const Input = styled.input`
  height: 30px;
  margin: 0;
  padding: 0;
  border: 0;
  background-color: transparent;
`;

export const Color: React.FC<ControlProps<string>> = ({
  id,
  value,
  label,
  onChange,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    {/* Swap out for react-color - https://casesandberg.github.io/react-color/#examples */}
    <Input
      id={id}
      type="color"
      defaultValue={(value as string) || '#ff0000'}
      onChange={(event) => onChange && onChange(event.target.value)}
    />
  </Control>
);
