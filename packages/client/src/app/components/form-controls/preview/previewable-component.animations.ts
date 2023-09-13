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
    transform: string;
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
    immediate: (key) =>
      ['top', 'left', 'width', 'pointerEvents', 'transformOrigin'].includes(
        key
      ),
    to: {
      top,
      left,
      width,
      opacity: isEditing ? 1 : 0,
      transformOrigin: 'top left',
      transform: isEditing ? 'scaleY(1)' : 'scaleY(0.5)',
      pointerEvents: isEditing ? 'initial' : 'none',
    },
    config: {
      tension: 700,
      friction: 40,
    },
  });

  return {
    editorAnimation,
    isVisible: visible,
    setVisible,
  };
};
