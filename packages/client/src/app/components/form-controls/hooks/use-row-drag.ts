import type {
  ConnectDragPreview,
  ConnectDragSource,
  DragSourceMonitor,
} from 'react-dnd';
import { useDrag } from 'react-dnd';
import { Drag } from '@editor/builder/types/drag';

type RowDragHook = {
  isDragging: boolean;
  drag: ConnectDragSource;
  preview: ConnectDragPreview;
};

export const useRowDrag = (index: number): RowDragHook => {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: Drag.OptionRow,
      item: () => ({
        index,
      }),
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index]
  );

  return {
    isDragging,
    drag,
    preview,
  };
};
