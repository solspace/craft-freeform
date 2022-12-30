import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const RowWrapper = styled(animated.div)`
  position: relative;

  //min-height: 72px;
  min-height: 1px;

  background-color: #f3f7fc00;
  border: 1px solid transparent;

  transition: all 0.2s ease-out;
  transform-origin: 50% 0%;

  &.current-row {
    border: 1px dashed #00000033;
    background-color: ${colors.gray050};
  }
`;

export const Container = styled(animated.div)`
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
  top: -6px;

  z-index: 3;

  height: 26px;
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

export const CellDropZone = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;

  display: none;

  pointer-events: none;

  &.active {
    //border: 1px dashed ${colors.blue050};
  }

  &.can-drop {
    display: block;
    z-index: 2;
  }
`;
