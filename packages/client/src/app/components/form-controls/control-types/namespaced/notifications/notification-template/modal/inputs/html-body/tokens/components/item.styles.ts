import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ItemWrapper = styled.div`
  padding: 0 ${spacings.sm} 3px;
  font-size: 14px;

  &.active {
    background-color: red;
    color: var(--color-white);
  }
`;
