import { animated } from 'react-spring';
import { scrollBar } from '@ff-client/styles/mixins';
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PreviewWrapper = styled.div`
  position: relative;
`;

export const EditableContentWrapper = styled(animated.div)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;

  box-shadow: ${shadows.panel};

  pointer-events: none;

  &.active {
    pointer-events: all;
  }
`;

export const PreviewContainer = styled.div`
  cursor: pointer;

  input,
  select,
  textarea {
    pointer-events: none;
  }
`;

export const PreviewEditor = styled.div`
  width: 100%;
  min-width: 800px;

  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: ${spacings.lg};

  box-shadow: ${shadows.box};
  border-radius: ${borderRadius.lg};
  background: ${colors.gray050};
`;

export const PreviewEditorContainer = styled.div`
  max-height: 600px;
  overflow-x: hidden;
  overflow-y: auto;

  ${scrollBar};
`;
