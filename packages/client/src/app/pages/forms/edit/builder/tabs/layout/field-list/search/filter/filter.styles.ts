import { animated } from 'react-spring';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

import { IconStyle } from '../search.style';

export const FilterIcon = styled.button`
  cursor: pointer;
  right: 1px;

  ${IconStyle}

  color: ${colors.gray300};
  transition: all 0.2s ease-out;

  background: white;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;

  &:before {
    content: '';

    position: absolute;
    left: 0;
    top: 6px;

    display: block;

    width: 1px;
    height: 22px;

    background: ${colors.gray200};
    transition: all 0.2s ease-out;
  }

  &:focus {
    outline: none;
  }

  &:hover:before {
    top: 0;
    height: 32px;
  }

  &.active {
    background: ${colors.gray050};
    border-bottom-right-radius: 0px;

    outline: none;

    &:before {
      top: 0;
      height: 32px;
    }
  }

  > svg {
    user-select: none;
    pointer-events: none;
  }
`;

export const DropDownWrapper = styled(animated.div)`
  position: absolute;
  top: 32px;
  right: -1px;

  padding: ${spacings.md} ${spacings.xl};
  white-space: nowrap;
  text-align: left;

  border: 1px solid ${colors.gray200};
  background: ${colors.white};
  box-shadow: rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset,
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;

  opacity: 0;

  transform-origin: top right;

  ${FilterIcon}.active & {
    display: block;
    background: ${colors.gray050};
  }

  &:before {
    content: '';

    position: absolute;
    top: -1px;
    right: 0px;

    width: 29px;
    height: 1px;

    background: ${colors.gray050};
  }
`;

export const Heading = styled.h3`
  margin: 0;
  padding: 0 0 ${spacings.xs};
`;

export const Item = styled.li`
  display: flex;
  gap: ${spacings.sm};
  text-align: left;
`;

export const ItemCheckbox = styled.input.attrs({
  type: 'checkbox',
})``;
