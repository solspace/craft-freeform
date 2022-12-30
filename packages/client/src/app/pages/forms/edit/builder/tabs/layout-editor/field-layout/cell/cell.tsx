import React from 'react';
import { useDrag } from 'react-dnd';
import type { Cell as CellPropType } from '@editor/builder/types/layout';
import { Drag } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';

import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';
import { Wrapper } from './cell.styles';

type Props = {
  cell: CellPropType;
  order?: number;
};

export const Cell: React.FC<Props> = ({ cell, order }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: Drag.Cell,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      item: cell,
    }),
    [cell]
  );

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
    <Wrapper ref={drag} style={{ order }}>
      <Component uid={cell.targetUid} />
    </Wrapper>
  );
};
