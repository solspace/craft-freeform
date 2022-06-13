import React from 'react';
import { useSelector } from 'react-redux';
import { useSprings } from 'react-spring';

import { selectCellsInRow } from '../../../store/slices/cells';
import { Row as RowType } from '../../../types/layout';
import { Cell } from '../cell/cell';
import { useRowDrag } from './hooks/use-row-drag';
import { Container, Placeholder, Wrapper } from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const cells = useSelector(selectCellsInRow(row));
  const { wrapperRef, dropRef, activePlaceholder, isOver } = useRowDrag(
    cells.length
  );

  const placeholders: number[] = Array.from(Array(cells.length + 1).keys());

  const springs = useSprings(
    placeholders.length,
    placeholders.map((index) => {
      return {
        to: {
          flexGrow: isOver && activePlaceholder === index ? 1 : 0,
          background: 'grey',
        },
      };
    })
  );

  return (
    <Wrapper ref={wrapperRef}>
      <Container
        ref={dropRef}
        style={{ backgroundColor: isOver ? 'pink' : 'white' }}
      >
        {cells.map((cell, index) => (
          <Cell cell={cell} key={cell.uid} order={(index + 1) * 10} />
        ))}

        {springs.map((style, index) => (
          <Placeholder
            key={`placeholder-${index}`}
            style={{ ...style, order: (index + 1) * 10 - 5 }}
          />
        ))}
      </Container>
    </Wrapper>
  );
};
