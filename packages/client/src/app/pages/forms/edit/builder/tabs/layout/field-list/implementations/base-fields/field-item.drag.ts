import { useEffect } from 'react';
import type { ConnectDragSource } from 'react-dnd';
import { useDrag } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { FieldType } from '@ff-client/types/fields';

import { useDragContext } from '../../../drag.context';

type FieldDrag = {
  ref: ConnectDragSource;
};

type DragCollect = {
  isDragging: boolean;
};

export const useBaseFieldDrag = (fieldType: FieldType): FieldDrag => {
  const { dragOn, dragOff } = useDragContext();
  const [{ isDragging }, ref] = useDrag<DragItem, unknown, DragCollect>(() => ({
    type: Drag.FieldType,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: {
      type: Drag.FieldType,
      data: fieldType,
    },
  }));

  useEffect(() => {
    if (isDragging) {
      dragOn(Drag.FieldType);
    } else {
      dragOff();
    }
  }, [isDragging]);

  return { ref };
};
