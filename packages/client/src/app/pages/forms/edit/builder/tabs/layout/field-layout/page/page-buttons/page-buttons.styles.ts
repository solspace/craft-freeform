import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ButtonGroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const Button = styled.button``;
