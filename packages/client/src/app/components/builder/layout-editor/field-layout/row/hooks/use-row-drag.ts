import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { ConnectDropTarget, useDrop } from 'react-dnd';

type RowDragHook = {
  wrapperRef: MutableRefObject<HTMLDivElement>;
  dropRef: ConnectDropTarget;
  activePlaceholder: number;
  isOver: boolean;
};

export const useRowDrag = (cellCount: number): RowDragHook => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number>(-1);
  const [activePlaceholder, setActivePlaceholder] = useState(-1);

  const [width, setWidth] = useState(0);
  const [left, setLeft] = useState(0);
  const [portion, setPortion] = useState(0);

  useEffect(() => {
    const dimensions = wrapperRef.current.getBoundingClientRect();

    setWidth(dimensions.width);
    setLeft(dimensions.left);
    setPortion(dimensions.width / cellCount);

    // TODO: implement resize updates
  }, [cellCount]);

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: ['BaseField'],
      hover: (_, monitor): void => {
        const offset = monitor.getClientOffset().x - left;

        const currentPortion = Math.floor(offset / portion);
        const isLeft = offset % portion < portion / 2;

        const newOrder = currentPortion + (isLeft ? 0 : 1);

        if (orderRef.current !== newOrder) {
          orderRef.current = newOrder;
          setActivePlaceholder(newOrder);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [left, width]
  );

  return {
    wrapperRef,
    dropRef,
    activePlaceholder,
    isOver,
  };
};
