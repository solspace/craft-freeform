import { useEffect, useRef, useState } from 'react';

type DimensionsObserverReturn<T extends HTMLElement> = {
  ref: React.RefObject<T>;
  dimensions: DOMRect | undefined;
};

export const useDimensionsObserver = <
  T extends HTMLElement = HTMLElement
>(): DimensionsObserverReturn<T> => {
  const ref = useRef<T>(null);

  const [dimensions, setDimensions] = useState<DOMRect>({
    height: 0,
    width: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    x: 0,
    y: 0,
    toJSON: () => void {},
  });

  const [resizeObserver] = useState(
    () =>
      new ResizeObserver(([entry]) => {
        setDimensions(entry.target.getBoundingClientRect());
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
