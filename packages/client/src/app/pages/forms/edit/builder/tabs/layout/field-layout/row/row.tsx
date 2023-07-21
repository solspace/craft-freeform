import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { cellSelectors } from '@editor/store/slices/layout/cells/cells.selectors';

import { Cell } from '../cell/cell';
import { CellDragPlaceholder } from '../cell/cell.placeholder';

import { usePlaceholderAnimation, useRowAnimation } from './row.animations';
import { useRowCellDrop } from './row.cell-drop';
import { useRowDimensions } from './row.dimensions';
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
  const cells = useSelector(cellSelectors.inRow(row));

  const [width, offsetX] = useRowDimensions(wrapperRef);

  const { ref: rowDropRef, isOver: isOverRow } = useRowDrop(row);
  const placeholderAnimation = usePlaceholderAnimation(isOverRow);
  const rowAnimation = useRowAnimation(isOverRow);

  const {
    ref: cellDropRef,
    isOver,
    isCurrentRow,
    isDraggingCell,
    dragCellIndex,
    hoverPosition,
    cellWidth,
  } = useRowCellDrop(wrapperRef, row, cells.length, width, offsetX);

  const ref = cellDropRef(
    wrapperRef
  ) as unknown as MutableRefObject<HTMLDivElement>;

  return (
    <RowWrapper ref={ref}>
      <DropZone ref={rowDropRef}>
        <DropZoneAnimation style={placeholderAnimation} />
      </DropZone>
      <RowCellsContainer style={rowAnimation}>
        <CellDragPlaceholder
          isActive={isOver}
          hoverPosition={hoverPosition}
          cellWidth={cellWidth}
        />
        {cells.map((cell, idx) => (
          <Cell
            cell={cell}
            isOver={isOver}
            hoverPosition={hoverPosition}
            isCurrentRow={isCurrentRow}
            isDraggingCell={isDraggingCell}
            dragCellIndex={dragCellIndex}
            index={idx}
            key={cell.uid}
            width={cellWidth || width}
          />
        ))}
      </RowCellsContainer>
    </RowWrapper>
  );
};
