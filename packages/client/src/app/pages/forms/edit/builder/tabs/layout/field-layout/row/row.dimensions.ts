import type { MutableRefObject } from "react";
import { useCallback, useEffect, useState } from "react";

export const useRowDimensions = (
  ref: MutableRefObject<HTMLDivElement>,
): [number, number] => {
  const [width, setWidth] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);

  const updateFieldWidth = useCallback((): void => {
    const boundingBox = ref.current.getBoundingClientRect();
    setWidth(boundingBox.width);
    setOffsetX(boundingBox.x);
  }, [ref]);

  useEffect(() => {
    if (ref.current) {
      const boundingBox = ref.current.getBoundingClientRect();
      setWidth(boundingBox.width);
      setOffsetX(boundingBox.x);
    }

    window.addEventListener("resize", updateFieldWidth);

    return () => {
      window.removeEventListener("resize", updateFieldWidth);
    };
  }, [ref, updateFieldWidth]);

  return [width, offsetX];
};
