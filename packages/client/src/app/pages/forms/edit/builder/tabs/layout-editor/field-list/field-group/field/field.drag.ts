import type { ConnectDragSource } from 'react-dnd';
import { useDrag } from 'react-dnd';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { FieldType } from '@ff-client/types/properties';

type FieldDrag = {
  drag: ConnectDragSource;
};

export const useFieldDrag = (fieldType: FieldType): FieldDrag => {
  const [, drag] = useDrag<DragItem>(() => ({
    type: Drag.FieldType,
    item: {
      type: Drag.FieldType,
      data: fieldType,
    },
  }));

  return { drag };
};
