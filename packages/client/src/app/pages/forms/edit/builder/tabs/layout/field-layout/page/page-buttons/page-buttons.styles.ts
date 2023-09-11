import { borderRadius, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ButtonGroupWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  padding: ${spacings.sm} ${spacings.md};

  border: 1px solid transparent;
  border-radius: ${borderRadius.md};

  cursor: pointer;

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.active {
    border: 1px dashed #5782ef;
  }

  &:hover {
    background: #f3f7fd;

    &:not(.active) {
      border: 1px solid #cdd8e4;
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.md};
`;

export const Button = styled.button``;
