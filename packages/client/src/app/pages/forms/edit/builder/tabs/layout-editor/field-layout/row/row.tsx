import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { selectCellsInRow } from '@editor/store/slices/cells';
import translate from '@ff-client/utils/translations';

import { Cell } from '../cell/cell';

import { useOnMountAnimation } from './row.animations';
import { useRowCellDrop } from './row.cell-drop';
import { calculateCellOffset, useRowDimensions } from './row.dimensions';
import { useRowDrop } from './row.drop';
import {
  DropZone,
  DropZoneAnimation,
  RowCellsContainer,
  RowWrapper,
} from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cells = useSelector(selectCellsInRow(row));
  const onMountAnimation = useOnMountAnimation();

  const [width, offsetX] = useRowDimensions(wrapperRef);

  const {
    ref: rowDropRef,
    placeholderAnimation,
    rowAnimation,
  } = useRowDrop(row);

  const {
    ref: cellDropRef,
    isOver,
    hoverPosition,
    cellWidth,
  } = useRowCellDrop(wrapperRef, row, cells.length, width, offsetX);

  const ref = cellDropRef(
    wrapperRef
  ) as unknown as MutableRefObject<HTMLDivElement>;

  return (
    <RowWrapper ref={ref} style={onMountAnimation}>
      <DropZone ref={rowDropRef}>
        <DropZoneAnimation style={placeholderAnimation}>
          {translate('+ insert row')}
        </DropZoneAnimation>
      </DropZone>
      <RowCellsContainer style={rowAnimation}>
        {cells.map((cell, idx) => (
          <Cell
            cell={cell}
            key={cell.uid}
            width={cellWidth || width}
            offsetPx={calculateCellOffset(
              isOver,
              idx,
              cellWidth,
              hoverPosition
            )}
          />
        ))}
      </RowCellsContainer>
    </RowWrapper>
  );
};
