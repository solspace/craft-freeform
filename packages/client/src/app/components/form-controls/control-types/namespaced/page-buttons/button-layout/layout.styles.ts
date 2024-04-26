import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ButtonLayoutWrapper = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacings.sm};

  margin-top: ${spacings.sm};
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 2px;
`;

export const Button = styled.button`
  display: block;
  padding: 3px 5px;

  border-radius: ${borderRadius.md};
  font-size: 16px;

  &:not(.enabled) {
    opacity: 0.2;
  }

  &.submit {
    background-color: ${colors.gray600} !important;
    fill: ${colors.white} !important;
  }
`;

export const LayoutBlock = styled.li`
  cursor: pointer;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 3px;

  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.md};
  background-color: ${colors.gray100};

  transition: background-color 0.2s ease-in-out;

  ${Button} {
    fill: ${colors.white};
    background: ${colors.gray300};
  }

  &.active {
    border-color: ${colors.gray500};
    background-color: ${colors.gray500};

    ${Button} {
      background: ${colors.white};
      fill: ${colors.gray500};

      &.submit {
        background-color: ${colors.gray200} !important;
        fill: ${colors.gray600} !important;
      }
    }
  }

  &:not(.active):hover {
    background-color: ${colors.gray200};
  }
`;
