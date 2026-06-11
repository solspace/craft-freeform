import { useEffect, useRef, useState } from "react";

type Rect = Pick<DOMRect, "width" | "height">;

type DimensionsObserverReturn<T extends HTMLElement> = {
  ref: React.RefObject<T>;
  dimensions: Rect;
};

export const useDimensionsObserver = <
  T extends HTMLElement = HTMLElement,
>(): DimensionsObserverReturn<T> => {
  const ref = useRef<T>(null);

  const [dimensions, setDimensions] = useState<Rect>({
    height: 0,
    width: 0,
  });

  const [resizeObserver] = useState(
    () =>
      new ResizeObserver(([entry]) => {
        // Use contentRect (the observer's own snapshot) rather than calling
        // getBoundingClientRect() here - calling getBoundingClientRect() inside
        // a ResizeObserver forces a synchronous layout and can read a size that
        // has already been inflated by the inline widths we set on child
        // elements, creating a runaway positive-feedback loop.
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }),
  );

  useEffect(() => {
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, [resizeObserver]);

  return { ref, dimensions };
};
