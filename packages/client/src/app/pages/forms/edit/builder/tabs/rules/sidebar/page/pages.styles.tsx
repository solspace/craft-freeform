import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacings.md};
`;

export const PageButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${spacings.sm};

  padding: ${spacings.xs} ${spacings.md};

  text-align: left;
  background-color: ${colors.gray100};

  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};

  transition: all 0.2s ease-out;

  &.active {
    border-color: ${colors.teal800};
    background-color: ${colors.teal550};
    color: ${colors.white};
  }

  &.has-rule {
    border-right: 4px solid ${colors.gray200};

    &.active {
      border-right-color: ${colors.teal700};
    }
  }

  &:active {
    outline: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
