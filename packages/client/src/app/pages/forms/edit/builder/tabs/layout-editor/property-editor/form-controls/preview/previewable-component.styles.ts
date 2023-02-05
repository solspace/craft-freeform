import { animated } from 'react-spring';
import { shadows } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PreviewWrapper = styled.div`
  position: relative;
`;

type EditorProps = {
  visible: boolean;
};

export const EditableContentWrapper = styled(animated.div)<EditorProps>`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;

  pointer-events: ${({ visible }) => (visible ? 'all' : 'none')};

  box-shadow: ${shadows.panel};
`;

export const PreviewContainer = styled.div`
  cursor: pointer;

  input,
  select,
  textarea {
    pointer-events: none;
  }
`;
