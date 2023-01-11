import { useEffect } from 'react';
import type { ConnectDragSource } from 'react-dnd';
import { useDrag } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { FieldType } from '@ff-client/types/properties';

import { useDragContext } from '../../../drag.context';

type FieldDrag = {
  drag: ConnectDragSource;
};

type DragCollect = {
  isDragging: boolean;
};

export const useFieldDrag = (fieldType: FieldType): FieldDrag => {
  const { dragOn, dragOff } = useDragContext();
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, DragCollect>(
    () => ({
      type: Drag.FieldType,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: {
        type: Drag.FieldType,
        data: fieldType,
      },
    })
  );

  useEffect(() => {
    if (isDragging) {
      dragOn(Drag.FieldType);
    } else {
      dragOff();
    }
  }, [isDragging]);

  return { drag };
};
