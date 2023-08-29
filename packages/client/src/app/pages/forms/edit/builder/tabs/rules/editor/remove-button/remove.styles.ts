import { animated } from 'react-spring';
import styled from 'styled-components';

export const RemoveButtonWrapper = styled(animated.button)`
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  padding: 3px;

  svg {
    width: 20px;
    height: 20px;

    color: currentColor;
  }
`;
