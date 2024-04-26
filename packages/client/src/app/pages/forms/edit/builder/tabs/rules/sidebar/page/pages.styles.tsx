import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { Button } from './buttons/buttons.styles';

export const PageWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const PageButton = styled.button`
  position: relative;
  bottom: -1px;

  display: inline-flex;
  justify-content: start;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${spacings.sm};

  max-width: 150px;
  padding: ${spacings.xs} ${spacings.sm};

  background-color: ${colors.white};

  border: 1px solid #cdd8e4;
  border-bottom: none;
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${colors.teal550};
    background-color: ${colors.teal050};

    &.active {
      border-right-color: ${colors.teal700};
    }
  }

  &.active {
    background-color: ${colors.gray500};
    border-color: ${colors.gray700};
    color: ${colors.white};
  }

  &,
  &:active,
  &:focus {
    outline: none;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

export const PageBody = styled.div`
  padding: ${spacings.sm};
  border: 1px solid #cdd8e4;
  background-color: ${colors.white};

  border-radius: 0 ${borderRadius.md} ${borderRadius.md} ${borderRadius.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${colors.teal550};
    background-color: ${colors.teal050};
  }

  &.active {
    background-color: ${colors.gray500};
    border-color: ${colors.gray700};

    ${Button} {
      background-color: ${colors.gray100};

      &.submit {
        background-color: ${colors.red600};
      }
    }
  }
`;

export const PageIcon = styled.div``;

export const PageLabel = styled.label`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
