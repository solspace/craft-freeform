import { animated } from 'react-spring';
import { scrollBar } from '@ff-client/styles/mixins';
import {
  beziers,
  borderRadius,
  colors,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FormTitle = styled.div`
  cursor: pointer;
  position: relative;

  padding: ${spacings.sm} ${spacings.xl} ${spacings.sm} ${spacings.sm};
  background: ${colors.elements.dropdown};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  user-select: none;
`;

export const FieldListContainer = styled(animated.div)`
  max-height: 0px;
  padding: ${spacings.sm};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;

const size = 12;
export const ExpandedState = styled.div`
  position: absolute;
  right: 10px;
  top: calc(50% - ${size / 2}px);

  height: ${size}px;
  width: ${size}px;
  font-size: ${size}px;

  transform: rotate(90deg);
  transform-origin: center;
  transition: transform 0.2s ${beziers.easeOut};
`;

export const FormBlockWrapper = styled.div`
  border: 1px solid ${colors.elements.dropdown};
  border-radius: ${borderRadius.md};

  margin: 0 -8px;

  &.open {
    ${ExpandedState} {
      transform: rotate(180deg);
    }
  }
`;
