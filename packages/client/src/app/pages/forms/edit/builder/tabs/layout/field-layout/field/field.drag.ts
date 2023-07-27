import { useEffect } from 'react';
import type { ConnectDragPreview, ConnectDragSource } from 'react-dnd';
import { useDrag } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Field } from '@editor/store/slices/layout/fields';

import { useDragContext } from '../../drag.context';

type DropResult = {
  isDragging: boolean;
};

type FieldDrag = DropResult & {
  drag: ConnectDragSource;
  preview: ConnectDragPreview;
};

export const useFieldDrag = (field: Field, index: number): FieldDrag => {
  const [{ isDragging }, drag, preview] = useDrag<
    DragItem,
    unknown,
    DropResult
  >(
    () => ({
      type: Drag.Field,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      item: {
        type: Drag.Field,
        data: field,
        index,
      },
    }),
    [field]
  );

  const { dragOn, dragOff } = useDragContext();

  useEffect(() => {
    if (isDragging) {
      dragOn(Drag.Field);
    } else {
      dragOff();
    }
  }, [isDragging]);

  return { isDragging, drag, preview };
};
