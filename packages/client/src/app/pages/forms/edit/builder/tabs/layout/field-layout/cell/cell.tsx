import React from 'react';
import { DragPreviewImage } from 'react-dnd';
import type { Cell as CellPropType } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';

import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';
import { useCellDragAnimation } from './cell.animations';
import { useCellDrag } from './cell.drag';
import { createPreview } from './cell.preview';
import { CellWrapper } from './cell.styles';

type Props = {
  cell: CellPropType;
  index: number;
  width?: number;
  isOver: boolean;
  isCurrentRow: boolean;
  isDraggingCell: boolean;
  dragCellIndex?: number;
  hoverPosition?: number;
};

export const Cell: React.FC<Props> = ({
  cell,
  index,
  width,
  isOver,
  isCurrentRow,
  isDraggingCell,
  dragCellIndex,
  hoverPosition,
}) => {
  const { isDragging, drag, preview } = useCellDrag(cell, index);
  const style = useCellDragAnimation({
    width,
    isDragging,
    isOver,
    isCurrentRow,
    isDraggingCell,
    dragCellIndex,
    index,
    hoverPosition,
  });

  let Component;
  switch (cell.type) {
    case CellType.Field:
      Component = CellField;
      break;

    case CellType.Layout:
      Component = CellLayout;
      break;
  }

  return (
    <>
      <DragPreviewImage connect={preview} src={createPreview(cell.type)} />
      <CellWrapper ref={drag} style={style}>
        <Component uid={cell.targetUid} />
      </CellWrapper>
    </>
  );
};
