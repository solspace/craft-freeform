import { animated } from 'react-spring';
import { colors, shadows, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

type PropertyEditorProps = {
  $active?: boolean;
};

export const PropertyEditorWrapper = styled.div<PropertyEditorProps>`
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;

  overflow: hidden;
  border-right: 1px solid rgb(154 165 177 / 25%);

  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
  background: ${({ $active }) => ($active ? colors.gray050 : 'transparent')};

  transition: background-color 0.2s ease-in-out;
`;

export const AnimatedBlock = styled(animated.div)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;
`;

export const CloseLink = styled.a`
  position: absolute;
  right: 10px;
  top: 17px;

  z-index: 5;

  display: block;
  width: 20px;
  height: 20px;
`;

export const Title = styled.h3`
  display: flex;
  justify-content: flex-start;
  align-items: end;
  gap: ${spacings.sm};

  margin: 0;
  padding: ${spacings.lg};

  font-size: 16px;
  box-shadow: ${shadows.bottom};

  > span {
    display: block;
  }
`;

export const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  svg {
    max-width: 20px;
    max-height: 20px;
  }
`;
