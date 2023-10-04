import type { RefObject } from 'react';
import React, { useRef } from 'react';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { Row } from '@components/form-controls/control-types/table/table.editor.styles';
import type { OptionRowDragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import classes from '@ff-client/utils/classes';
import type { Identifier, XYCoord } from 'dnd-core';

type Props = {
  index: number;
  dragRef: RefObject<HTMLButtonElement>;
  onDrop: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
};

export const DraggableRow: React.FC<Props> = ({
  index,
  dragRef,
  onDrop,
  children,
}) => {
  const previewRef = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop<
    OptionRowDragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: Drag.OptionRow,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: OptionRowDragItem, monitor: DropTargetMonitor) {
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
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: Drag.OptionRow,
    item: () => ({
      index,
    }),
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(dragRef);
  drop(preview(previewRef));

  return (
    <Row
      ref={previewRef}
      className={classes(isDragging && 'dragging')}
      data-handler-id={handlerId}
    >
      {children}
    </Row>
  );
};
