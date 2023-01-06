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

type CalculateOffset = (props: {
  isOver: boolean;
  currentIndex: number;
  cellWidth?: number;
  hoverPosition?: number;
  hoverItemOriginalIndex?: number;
  isCurrentRow: boolean;
}) => number | undefined;

export const calculateCellOffset: CalculateOffset = ({
  isOver,
  currentIndex,
  cellWidth,
  hoverPosition,
  hoverItemOriginalIndex,
  isCurrentRow,
}): number | undefined => {
  if (!isOver || hoverPosition === undefined || cellWidth === undefined) {
    return 0;
  }

  if (isCurrentRow && hoverItemOriginalIndex <= currentIndex) {
    currentIndex -= 1;
  }

  if (hoverPosition <= currentIndex) {
    return cellWidth;
  }

  if (hoverPosition > currentIndex) {
    return 0;
  }

  return 0;
};
