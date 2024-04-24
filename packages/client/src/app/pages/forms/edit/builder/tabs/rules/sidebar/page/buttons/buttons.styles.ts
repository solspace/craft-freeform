import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  margin-top: ${spacings.md};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.xs};
`;

export const Button = styled.button`
  flex: 1 1;
  max-width: 60px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.active {
    border: 3px solid green;
  }
`;
