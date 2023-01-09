import React from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { selectCellsInRow } from '@editor/store/slices/cells';
import translate from '@ff-client/utils/translations';

import { Cell } from '../cell/cell';

import { useRowDrop } from './row.drop';
import { Container, DropZone, DropZoneAnimation, Wrapper } from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const cells = useSelector(selectCellsInRow(row));
  const { dropRef, placeholderAnimation, rowAnimation } = useRowDrop(row);

  return (
    <Wrapper>
      <DropZone ref={dropRef}>
        <DropZoneAnimation style={placeholderAnimation}>
          {translate('+ insert row')}
        </DropZoneAnimation>
      </DropZone>
      <Container style={rowAnimation}>
        {cells.map((cell) => (
          <Cell cell={cell} key={cell.uid} />
        ))}
      </Container>
    </Wrapper>
  );
};
