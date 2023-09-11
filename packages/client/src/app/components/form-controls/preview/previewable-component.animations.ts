import { useState } from 'react';
import type { SpringValues } from 'react-spring';
import { useSpring } from 'react-spring';

import { usePosition } from './previewable-component.hooks';

type EditorAnimations = (options: {
  wrapper: HTMLDivElement;
  editor: HTMLDivElement;
  isEditing: boolean;
}) => {
  editorAnimation: SpringValues<{
    top: number;
    left: number;
    opacity: number;
    y: number;
  }>;
};

export const useEditorAnimations: EditorAnimations = ({
  wrapper,
  editor,
  isEditing,
}) => {
  const { top, left } = usePosition(wrapper, editor, isEditing);
  const width = wrapper?.offsetWidth;

  const [visible, setVisible] = useState(false);

  const editorAnimation = useSpring({
    immediate: (key) => {
      if (['top', 'left', 'width', 'pointerEvents'].includes(key)) {
        return true;
      }

      return false;
    },
    to: {
      top,
      left,
      width,
      opacity: isEditing ? 1 : 0,
      y: isEditing ? 0 : 20,
      pointerEvents: isEditing ? 'initial' : 'none',
    },
    config: {
      tension: 500,
    },
  });

  return {
    editorAnimation,
    isVisible: visible,
    setVisible,
  };
};
