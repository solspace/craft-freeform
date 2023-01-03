import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSpring } from 'react-spring';
import type { Row as RowType } from '@editor/builder/types/layout';
import { selectCellsInRow } from '@editor/store/slices/cells';
import translate from '@ff-client/utils/translations';

import { Cell } from '../cell/cell';

import { useOnMountAnimation } from './row.animations';
import { useRowCellDrop } from './row.cell-drop';
import { useRowDrop } from './row.drop';
import {
  CellPlaceholder,
  DropZone,
  DropZoneAnimation,
  RowCellsContainer,
  RowWrapper,
} from './row.styles';

type Props = {
  row: RowType;
};

const calculateOffset = (
  isOver: boolean,
  currentIndex: number,
  cellWidth?: number,
  placeholderPos?: number
): number | undefined => {
  if (!isOver) {
    return undefined;
  }

  if (placeholderPos === undefined || cellWidth === undefined) {
    return undefined;
  }

  if (placeholderPos > currentIndex) {
    return -cellWidth;
  }

  if (placeholderPos < currentIndex) {
    return cellWidth;
  }

  return 0;
};

export const Row: React.FC<Props> = ({ row }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cells = useSelector(selectCellsInRow(row));
  const onMountAnimation = useOnMountAnimation();

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
    placeholderPos,
    cellWidth,
  } = useRowCellDrop(wrapperRef, row, cells.length);

  const ref = cellDropRef(
    wrapperRef
  ) as unknown as MutableRefObject<HTMLDivElement>;

  const cellPlaceholderAnimation = useSpring({
    from: {
      flexGrow: 0,
      x: 0,
    },
    to: {
      flexGrow: isOver ? 1 : 0,
      x: placeholderPos * cellWidth,
    },
    config: {
      tension: 200,
      friction: 10,
      mass: 0.1,
    },
  });

  return (
    <RowWrapper
      ref={ref}
      style={onMountAnimation}
      //className={classes(isCurrentRow && cells.length === 1 && 'empty')}
    >
      <DropZone ref={rowDropRef}>
        <DropZoneAnimation style={placeholderAnimation}>
          {translate('+ insert row')}
        </DropZoneAnimation>
      </DropZone>
      <RowCellsContainer style={rowAnimation}>
        <CellPlaceholder style={cellPlaceholderAnimation} />
        {cells.map((cell, idx) => (
          <Cell
            cell={cell}
            key={cell.uid}
            offsetPx={calculateOffset(isOver, idx, cellWidth, placeholderPos)}
          />
        ))}
      </RowCellsContainer>
    </RowWrapper>
  );
};
