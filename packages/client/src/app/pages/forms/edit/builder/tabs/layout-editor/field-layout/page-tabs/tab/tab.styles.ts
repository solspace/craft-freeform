import { animated } from 'react-spring';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TabWrapper = styled(animated.div)`
  position: relative;
`;

export const NewTabWrapper = styled(TabWrapper)`
  justify-self: flex-end;
`;

export const PageTab = styled(animated.div)`
  padding: 4px 18px;
  border-radius: 4px 4px 0 0;
  background: white;
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);

  white-space: nowrap;
  overflow: hidden;

  &.active {
    background: ${colors.gray050};
  }

  &.can-drop {
    box-shadow: 0 2px 12px ${colors.gray500};
    transform: scale(1.1);
    z-index: 2;
  }

  &.is-dragging {
    z-index: 1;
  }

  &:hover {
    cursor: pointer;
  }
`;

export const TabDrop = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  width: 100%;
`;
