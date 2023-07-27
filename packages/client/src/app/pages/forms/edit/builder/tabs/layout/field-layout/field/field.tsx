import React, { useState } from 'react';
import { DragPreviewImage } from 'react-dnd';
import type { Field as FieldPropType } from '@editor/store/slices/layout/fields';

import { FieldCell } from './cell/cell';
import { Remove } from './remove-button/remove';
import { useFieldDragAnimation } from './field.animations';
import { useFieldDrag } from './field.drag';
import { createPreview } from './field.drag.preview';
import { FieldWrapper } from './field.styles';

type Props = {
  field: FieldPropType;
  index: number;
  width?: number;
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingCell: boolean;
  dragCellIndex?: number;
  hoverPosition?: number;
};

export const Field: React.FC<Props> = ({
  field,
  index,
  width,
  isOver,
  isCurrentRow,
  isDraggingCell,
  dragCellIndex,
  hoverPosition,
}) => {
  const [hovering, setHovering] = useState(false);
  const { isDragging, drag, preview } = useFieldDrag(field, index);
  const style = useFieldDragAnimation({
    width,
    isDragging,
    isOver,
    isCurrentRow,
    isDraggingCell,
    dragCellIndex,
    index,
    hoverPosition,
  });

  return (
    <>
      <DragPreviewImage
        connect={preview}
        src={createPreview(field.properties?.label)}
      />
      <FieldWrapper
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        ref={drag}
        style={style}
      >
        <Remove field={field} active={hovering} />
        <FieldCell field={field} />
      </FieldWrapper>
    </>
  );
};
