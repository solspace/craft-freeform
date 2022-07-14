import React from 'react';
import { useSelector } from 'react-redux';

import { selectCellsInRow } from '../../../store/slices/cells';
import { Row as RowType } from '../../../types/layout';
import { Cell } from '../cell/cell';
import { useRowDrop } from './hooks/use-row-drop';
import { Container, Placeholder, Wrapper } from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const cells = useSelector(selectCellsInRow(row));

  const { dropRef, placeholderStyle, isOver } = useRowDrop(row, cells.length);

  return (
    <Wrapper ref={dropRef}>
      <Container style={{ backgroundColor: isOver ? 'pink' : 'white' }}>
        <Placeholder style={placeholderStyle} />

        {cells.map((cell, index) => (
          <Cell cell={cell} key={cell.uid} order={(index + 1) * 10} />
        ))}
      </Container>
    </Wrapper>
  );
};
