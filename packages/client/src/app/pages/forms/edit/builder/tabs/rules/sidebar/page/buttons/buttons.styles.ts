import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
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

  height: 22px;
  max-width: 60px;
  padding: 0 ${spacings.sm};

  border: 2px solid transparent;
  border-radius: ${borderRadius.lg};
  background-color: rgba(96, 125, 159, 0.25);

  font-size: 12px;
  line-height: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  transition: background-color 0.2s ease-out;

  &.active {
    background-color: ${colors.gray600};
    color: white;
  }

  &:hover:not(.active) {
    background-color: rgba(96, 125, 159, 0.3);
  }

  &.submit {
    background-color: ${colors.red600};
    color: ${colors.white};

    &.active {
      background-color: ${colors.red900};
    }

    &:hover:not(.active) {
      background-color: #c82020;
    }
  }

  &.has-rule {
    border-color: ${colors.teal550};
  }
`;
