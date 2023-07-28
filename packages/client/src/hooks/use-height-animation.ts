import { useEffect, useRef, useState } from 'react';

type Rect = Pick<DOMRect, 'width' | 'height' | 'x' | 'y'>;

type DimensionsObserverReturn<T extends HTMLElement> = {
  ref: React.RefObject<T>;
  dimensions: Rect;
};

export const useDimensionsObserver = <
  T extends HTMLElement = HTMLElement
>(): DimensionsObserverReturn<T> => {
  const ref = useRef<T>(null);

  const [dimensions, setDimensions] = useState<Rect>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const [resizeObserver] = useState(
    () =>
      new ResizeObserver(([entry]) => {
        const { width, height, x, y } = entry.target.getBoundingClientRect();
        setDimensions({ width, height, x, y });
      })
  );

  useEffect(() => {
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, [resizeObserver]);

  return { ref, dimensions };
};
