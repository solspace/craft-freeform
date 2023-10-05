import type { MutableRefObject } from 'react';
import type { ConnectDropTarget, DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { OptionRowDragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Identifier, XYCoord } from 'dnd-core';

type CollectedProps = { handlerId: Identifier | null };

type RowDropHook = {
  handlerId: Identifier;
  drop: ConnectDropTarget;
};

export const useRowDrop = (
  index: number,
  previewRef: MutableRefObject<HTMLTableRowElement>,
  onDrop: (fromIndex: number, toIndex: number) => void
): RowDropHook => {
  const [{ handlerId }, drop] = useDrop<
    OptionRowDragItem,
    void,
    CollectedProps
  >(
    () => ({
      accept: Drag.OptionRow,
      collect: (monitor) => ({
        handlerId: monitor.getHandlerId(),
      }),
      hover: (item: OptionRowDragItem, monitor: DropTargetMonitor) => {
        if (!previewRef.current) {
          return;
        }

        const toIndex = index;
        const fromIndex = item.index;

        if (fromIndex === toIndex) {
          return;
        }

        const hoverBoundingRect = previewRef.current?.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset() as XYCoord;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (fromIndex < toIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        if (fromIndex > toIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        onDrop(fromIndex, toIndex);

        item.index = toIndex;
      },
    }),
    [previewRef, onDrop]
  );

  return {
    handlerId,
    drop,
  };
};
