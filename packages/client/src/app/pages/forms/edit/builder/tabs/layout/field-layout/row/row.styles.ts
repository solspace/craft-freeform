import { animated } from 'react-spring';
import { borderRadius, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

const minHeight = '72px';

export const RowWrapper = styled(animated.div)`
  position: relative;

  min-height: 1px;
  margin: 0 -${spacings.lg};

  background-color: #f3f7fc00;
  border: 1px solid transparent;

  transition: all 0.2s ease-out;
  transform-origin: 50% 0%;
`;

export const RowFieldsContainer = styled(animated.div)`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

export const DropZone = styled.div`
  position: absolute;
  left: ${spacings.sm};
  right: ${spacings.sm};
  top: -10px;

  z-index: 4;

  height: 20px;
`;

export const DropZoneAnimation = styled(animated.div)`
  position: relative;
  top: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 100%;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${borderRadius.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;

export const FieldPlaceholder = styled(animated.div)`
  border: 2px dashed grey;

  min-height: ${minHeight};
  flex-grow: 1;
  flex-shrink: 0;
`;
