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
  offsetPx?: number;
  width?: number;
};

export const Cell: React.FC<Props> = ({ cell, index, offsetPx, width }) => {
  const { isDragging, drag, preview } = useCellDrag(cell, index);
  const style = useCellDragAnimation(width, offsetPx);

  if (isDragging) {
    return null;
  }

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
