import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TabWrapper = styled.div`
  box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%);

  padding: 4px 18px;
  border-radius: 4px 4px 0 0;
  background: white;

  transform-origin: bottom center;
  transition: all 0.2s ease-out;

  &.active {
    background: ${colors.gray050};
  }

  &.can-drop {
    box-shadow: 0 2px 12px ${colors.gray500};
    transform: scale(1.1);
    z-index: 2;
  }

  &:hover {
    cursor: pointer;
  }
`;

export const NewTabWrapper = styled(TabWrapper)`
  justify-self: flex-end;
`;
