import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;

  width: 100%;
`;

export const Button = styled.button`
  display: block;
  flex: 1;

  padding: ${spacings.xs} ${spacings.md};

  background-color: ${colors.gray100};
  box-shadow: ${shadows.right};
  box-sizing: border-box;

  &.active {
    color: ${colors.white};
    background-color: ${colors.gray500};
  }

  &:first-child {
    border-top-left-radius: ${borderRadius.lg};
    border-bottom-left-radius: ${borderRadius.lg};
  }

  &:last-child {
    border-top-right-radius: ${borderRadius.lg};
    border-bottom-right-radius: ${borderRadius.lg};

    box-shadow: none;
  }
`;
