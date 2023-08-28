import { useEffect, useState } from 'react';
import { usePortal } from '@editor/builder/contexts/portal.context';
import { SectionWrapper } from '@editor/builder/tabs/layout/property-editor/section-block.styles';

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

  const updatePosition = (): void => {
    setTop(calculateTopOffset(wrapper, editor));
    const currentLeft = wrapper?.getBoundingClientRect()?.left;
    if (currentLeft) {
      setLeft(currentLeft - dimensions.left);
    }
  };

  useEffect(() => {
    updatePosition();
  }, [isEditing]);

  useEffect(() => {
    const resizeCallback = (): void => {
      updatePosition();
    };

    if (editor) {
      const sectionWrapper = document.querySelector(SectionWrapper);

      const resizeObserver = new ResizeObserver(resizeCallback);
      resizeObserver.observe(editor);

      window.addEventListener('resize', resizeCallback);
      window.addEventListener('scroll', resizeCallback);

      sectionWrapper?.addEventListener('scroll', resizeCallback);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', resizeCallback);
        window.removeEventListener('scroll', resizeCallback);

        sectionWrapper?.addEventListener('scroll', resizeCallback);
      };
    }
  }, [editor]);

  return {
    top,
    left,
  };
};
