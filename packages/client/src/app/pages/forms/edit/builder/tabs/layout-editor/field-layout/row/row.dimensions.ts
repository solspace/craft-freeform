import type { MutableRefObject } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

export const useRowDimensions = (
  ref: MutableRefObject<HTMLDivElement>
): [number, number] => {
  const [width, setWidth] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);

  const updateCellWidth = (): void => {
    const boundingBox = ref.current.getBoundingClientRect();
    setWidth(boundingBox.width);
    setOffsetX(boundingBox.x);
  };

  useEffect(() => {
    if (ref.current) {
      const boundingBox = ref.current.getBoundingClientRect();
      setWidth(boundingBox.width);
      setOffsetX(boundingBox.x);
    }

    window.addEventListener('resize', updateCellWidth);

    return () => {
      window.removeEventListener('resize', updateCellWidth);
    };
  }, [ref]);

  return [width, offsetX];
};

export const calculateCellOffset = (
  isOver: boolean,
  currentIndex: number,
  cellWidth?: number,
  hoverPosition?: number
): number | undefined => {
  if (!isOver) {
    return undefined;
  }

  if (hoverPosition === undefined || cellWidth === undefined) {
    return undefined;
  }

  if (hoverPosition <= currentIndex) {
    return cellWidth;
  }

  if (hoverPosition > currentIndex) {
    console.log(hoverPosition, currentIndex);
    //return 0;
  }

  return 0;
};
