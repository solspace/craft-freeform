import { animated } from 'react-spring';
import styled from 'styled-components';

export const RemoveButtonWrapper = styled(animated.button)`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  font-size: 16px;

  border-radius: 50%;
  padding: 3px;

  svg {
    color: currentColor;
  }
`;
