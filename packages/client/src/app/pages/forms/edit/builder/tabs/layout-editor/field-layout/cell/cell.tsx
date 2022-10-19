import React from 'react';
import { useDrag } from 'react-dnd';

import { setCell } from '../../../../../store/slices/drag';
import { useAppDispatch } from '../../../../../store/store';
import { Cell as CellPropType, CellType } from '../../../../types/layout';
import { Wrapper } from './cell.styles';
import { CellField } from './cell-types/cell-field/cell-field';
import { CellLayout } from './cell-types/cell-layout/cell-layout';

type Props = {
  cell: CellPropType;
  order?: number;
};

export const Cell: React.FC<Props> = ({ cell, order }) => {
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
