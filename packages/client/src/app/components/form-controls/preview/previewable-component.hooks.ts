import { useEffect, useState } from 'react';
import { usePortal } from '@editor/builder/contexts/portal.context';

import { calculateTopOffset } from './previewable-component.operations';

type Position = {
  top: number;
  left: number;
};

export const usePosition = (
  wrapper: HTMLDivElement,
  editor: HTMLDivElement,
  isEditing: boolean
): Position => {
  const { dimensions } = usePortal();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    setTop(calculateTopOffset(wrapper, editor));

    const currentLeft = wrapper?.getBoundingClientRect()?.left;
    if (currentLeft) {
      setLeft(currentLeft - dimensions.left);
    }
  }, [isEditing]);

  useEffect(() => {
    const resizeCallback = (): void => {
      setTop(calculateTopOffset(wrapper, editor));
    };

    if (editor) {
      const resizeObserver = new ResizeObserver(resizeCallback);
      resizeObserver.observe(editor);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [editor]);

  return {
    top,
    left,
  };
};
