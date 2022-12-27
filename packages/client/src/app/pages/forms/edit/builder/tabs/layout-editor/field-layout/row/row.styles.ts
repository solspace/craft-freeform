import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
`;

export const Container = styled(animated.div)`
  //border: 3px dashed red;

  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: ${spacings.lg};
`;

export const DropZone = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: -10px;

  height: 18px;
`;

export const DropZoneAnimation = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 100%;

  background-color: ${colors.gray050};
  border: 1px solid ${colors.hairline};
  border-radius: ${borderRadius.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;
