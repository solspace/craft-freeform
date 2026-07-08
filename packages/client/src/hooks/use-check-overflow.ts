import type { RefCallback } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

export const useCheckOverflow = <T extends HTMLElement>(
  tolerance = 1,
): [RefCallback<T>, boolean] => {
  const [element, setElement] = useState<T | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const textRef = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!element) {
      setIsOverflowing(false);
      return;
    }

    const checkOverflow = (): void => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        const styles = window.getComputedStyle(element);

        const clone = document.createElement("span");
        clone.textContent = element.textContent ?? "";

        Object.assign(clone.style, {
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          font: styles.font,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          fontFamily: styles.fontFamily,
          letterSpacing: styles.letterSpacing,
          textTransform: styles.textTransform,
        });

        document.body.appendChild(clone);

        const textWidth = clone.getBoundingClientRect().width;
        const containerWidth = element.getBoundingClientRect().width;

        document.body.removeChild(clone);

        setIsOverflowing(textWidth > containerWidth + tolerance);
      });
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    if (element.parentElement) {
      observer.observe(element.parentElement);
    }

    window.addEventListener("resize", checkOverflow);

    return () => {
      observer.disconnect();

      window.removeEventListener("resize", checkOverflow);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [element, tolerance]);

  return [textRef, isOverflowing];
};
