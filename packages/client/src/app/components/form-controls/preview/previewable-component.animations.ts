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
    x: number;
    rotate: number;
  }>;
};

export const useEditorAnimations: EditorAnimations = ({
  wrapper,
  editor,
  isEditing,
}) => {
  const { top, left } = usePosition(wrapper, editor, isEditing);

  const [visible, setVisible] = useState(false);

  const editorAnimation = useSpring({
    to: {
      top,
      left,
      opacity: isEditing ? 1 : 0,
      x: isEditing ? 0 : 20,
      rotate: isEditing ? 0 : 10,
    },
    config: {
      tension: 700,
    },
  });

  return {
    editorAnimation,
    isVisible: visible,
    setVisible,
  };
};
