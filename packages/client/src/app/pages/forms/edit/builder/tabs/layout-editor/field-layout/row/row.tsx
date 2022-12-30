import React from 'react';
import { useSelector } from 'react-redux';
import { useSpring } from 'react-spring';
import type { Row as RowType } from '@editor/builder/types/layout';
import { selectCellsInRow } from '@editor/store/slices/cells';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { Cell } from '../cell/cell';

import { useRowCellDrop } from './row.cell-drop';
import { useRowDrop } from './row.drop';
import {
  CellDropZone,
  Container,
  DropZone,
  DropZoneAnimation,
  RowWrapper,
} from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const cells = useSelector(selectCellsInRow(row));

  const {
    ref: rowDropRef,
    placeholderAnimation,
    rowAnimation,
  } = useRowDrop(row);

  const {
    ref: cellDropRef,
    isOver,
    canDrop,
    isCurrentRow,
  } = useRowCellDrop(row);

  const styles = useSpring({
    from: {
      opacity: 0,
      height: 1,
      transform: 'scaleY(0)',
    },
    to: {
      opacity: 1,
      height: 72,
      transform: 'scaleY(1)',
    },
    config: {
      friction: 23,
      tension: 1000,
      precision: 0.00001,
    },
  });

  return (
    <RowWrapper
      ref={cellDropRef}
      style={styles}
      className={classes(isCurrentRow && 'current-row')}
    >
      <DropZone ref={rowDropRef}>
        <DropZoneAnimation style={placeholderAnimation}>
          {translate('+ insert row')}
        </DropZoneAnimation>
      </DropZone>
      <CellDropZone
        className={classes(isOver && 'active', canDrop && 'can-drop')}
      />
      <Container style={rowAnimation}>
        {cells.map((cell) => (
          <Cell cell={cell} key={cell.uid} />
        ))}
      </Container>
    </RowWrapper>
  );
};
