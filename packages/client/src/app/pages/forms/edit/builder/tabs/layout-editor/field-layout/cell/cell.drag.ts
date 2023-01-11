import { useEffect } from 'react';
import type { ConnectDragPreview, ConnectDragSource } from 'react-dnd';
import { useDrag } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Cell } from '@editor/builder/types/layout';

import { useDragContext } from '../../drag.context';

type DropResult = {
  isDragging: boolean;
};

type CellDrag = DropResult & {
  drag: ConnectDragSource;
  preview: ConnectDragPreview;
};

export const useCellDrag = (cell: Cell, index: number): CellDrag => {
  const [{ isDragging }, drag, preview] = useDrag<
    DragItem,
    unknown,
    DropResult
  >(
    () => ({
      type: Drag.Cell,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      item: {
        type: Drag.Cell,
        data: cell,
        index,
      },
    }),
    [cell]
  );

  const { dragOn, dragOff } = useDragContext();

  useEffect(() => {
    if (isDragging) {
      dragOn(Drag.Cell);
    } else {
      dragOff();
    }
  }, [isDragging]);

  return { isDragging, drag, preview };
};
