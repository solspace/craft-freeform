import React from 'react';
import { useDrag } from 'react-dnd';
import { useSpring } from 'react-spring';
import type { Cell as CellPropType } from '@editor/builder/types/layout';
import { Drag } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';

import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';
import { Wrapper } from './cell.styles';

type Props = {
  cell: CellPropType;
  offsetPx?: number;
  width?: number;
};

export const Cell: React.FC<Props> = ({ cell, offsetPx, width }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: Drag.Cell,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      item: cell,
    }),
    [cell]
  );

  const style = useSpring({
    to: {
      width,
      x: offsetPx || 0,
    },
    config: {
      tension: 700,
      mass: 0.5,
    },
  });

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
    <Wrapper ref={drag} style={style}>
      <Component uid={cell.targetUid} />
    </Wrapper>
  );
};
