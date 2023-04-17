import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ValueWrapper = styled.div`
  flex-basis: 20%;
`;

export const Input = styled.input`
  &.disabled {
    background: #dfe5ec;
    color: ${colors.black};
    opacity: 0.55;
  }
`;
