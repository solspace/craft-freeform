import { usePortal } from "@editor/builder/contexts/portal.context";
import { SectionWrapper } from "@editor/builder/tabs/layout/property-editor/section-block.styles";
import { useCallback, useEffect, useState } from "react";

import { calculateTopOffset } from "./previewable-component.operations";

type Position = {
  top: number;
  left: number;
};

export const usePosition = (
  wrapper: HTMLDivElement,
  editor: HTMLDivElement,
  isEditing: boolean,
): Position => {
  const { dimensions } = usePortal();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  // RAF-throttled updater to avoid excessive state churn on scroll/resize
  let rafId: number | null = null;
  const updatePosition = useCallback((): void => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      setTop(calculateTopOffset(wrapper, editor));
      const currentLeft = wrapper?.getBoundingClientRect()?.left;
      if (currentLeft != null && dimensions) {
        setLeft(currentLeft - dimensions.left);
      }
    });
  }, [wrapper, editor, dimensions, rafId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is by design - we only want to update position when editing state changes, not on every render
  useEffect(() => {
    updatePosition();
  }, [isEditing]);

  useEffect(() => {
    const resizeCallback = (): void => {
      updatePosition();
    };

    if (editor) {
      const sectionWrapper = document.querySelector(SectionWrapper.toString());

      const resizeObserver = new ResizeObserver(resizeCallback);
      resizeObserver.observe(editor);

      window.addEventListener("resize", resizeCallback);
      window.addEventListener("scroll", resizeCallback);
      sectionWrapper?.addEventListener("scroll", resizeCallback);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", resizeCallback);
        window.removeEventListener("scroll", resizeCallback);
        sectionWrapper?.removeEventListener("scroll", resizeCallback);

        // Cancel any pending frame
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [editor, rafId, updatePosition]);

  return {
    top,
    left,
  };
};
