import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PopUpWrapper = styled(animated.div)`
  position: absolute;
  top: 24px;
  right: -16px;

  transform-origin: 90% -20%;
`;

export const IconBox = styled.div`
  position: absolute;
  top: -30px;
  right: 10px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-content: center;

  width: 32px;
  height: 32px;

  padding: 5px;

  background: ${colors.gray050};

  border-style: solid;
  border-width: 1px;
  border-color: ${colors.barelyVisible};
  border-bottom-color: transparent;
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

  transform-origin: center bottom;
`;

export const InfoBlock = styled.div`
  position: relative;
  z-index: 1;

  width: 240px;
  padding: ${spacings.lg};

  background: ${colors.gray050};
  border: 1px solid ${colors.barelyVisible};
  border-radius: ${borderRadius.md};

  box-shadow: 4px 12px 8px rgb(205 216 228 / 80%);
`;

export const Button = styled(animated.button)`
  position: relative;
  z-index: 5;

  width: 20px;
  height: 20px;

  svg {
    fill: ${colors.barelyVisible};
  }
`;

export const FavoriteButtonWrapper = styled.div`
  position: absolute;
  top: 17px;
  right: 40px;
  z-index: 3;

  background: none;
  border: none;

  display: flex;
  justify-content: center;
  align-content: center;

  &:not(.active) {
    ${PopUpWrapper} {
      pointer-events: none;
    }
  }
`;
