import { animated } from 'react-spring';
import { scrollBar } from '@ff-client/styles/mixins';
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Search = styled.input`
  width: 100%;
  padding: 7px 30px 7px 10px;

  border-bottom: 1px solid ${colors.hairline};

  &:focus,
  &:active,
  &:hover {
    box-shadow: none;
    outline: none;
  }
`;

export const ListWrapper = styled.div`
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  ${scrollBar};
`;

export const CurrentValue = styled.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: start;
  gap: ${spacings.sm};

  background-color: #dfe5ec;
  border-radius: ${borderRadius.lg};

  padding: 7px 22px 7px 10px;

  > span {
    min-height: 20px;
  }

  &:hover {
    box-shadow: var(--focus-ring);
    outline-color: transparent;
  }

  &:after {
    content: '';
    position: absolute;
    top: calc(50% - 5px);
    right: 9px;

    display: block;
    width: 7px;
    height: 7px;

    opacity: 0.8;
    border: solid;
    border-width: 0 2px 2px 0;

    font-size: 0;

    transform: rotate(45deg);

    user-select: none;
    pointer-events: none;
  }
`;

export const SpinnerWrapper = styled.div`
  > svg {
    fill: currentColor;
    width: 20px;
    height: 20px;
  }
`;

export const DropdownRollout = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 4;

  background-color: ${colors.gray050};
  border: 1px solid ${colors.gray200};
  border-top: none;
  border-radius: ${borderRadius.lg};

  box-shadow: ${shadows.container};

  overflow: hidden;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: 34px;

  cursor: pointer;

  &:hover {
    background-color: ${colors.gray050};
  }
`;

export const DropdownWrapper = styled.div`
  position: relative;

  &.open {
    ${DropdownRollout} {
      display: block;
    }

    ${CurrentValue} {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      &:hover {
        box-shadow: none;
        outline-color: transparent;
      }
    }
  }
`;
