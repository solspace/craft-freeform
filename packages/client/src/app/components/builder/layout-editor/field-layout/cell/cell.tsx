import React from 'react';
import { useDrag } from 'react-dnd';

import { setCell } from '../../../store/slices/drag';
import { useAppDispatch } from '../../../store/store';
import { Cell as CellPropType, CellType } from '../../../types/layout';
import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';
import { Wrapper } from './cell.styles';

type Props = {
  cell: CellPropType;
  order?: number;
};

export const Cell: React.FC<Props> = ({ cell, order }) => {
  let component = null;
  const dispatch = useAppDispatch();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'LayoutField',
      item: (): Record<string, string> => {
        dispatch(setCell(cell.uid));

        return {};
      },
      end: (): void => {
        dispatch(setCell(undefined));
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [cell.uid]
  );

  if (cell.type === CellType.Layout) {
    component = <CellLayout layoutUid={cell.metadata.layoutUid} />;
  } else {
    component = <CellField fieldUid={cell.uid} />;
  }

  return (
    <Wrapper ref={drag} style={{ order }}>
      {component}
    </Wrapper>
  );
};
