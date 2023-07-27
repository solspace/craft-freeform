import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';

import { Field } from '../field/field';
import { FieldDragPlaceholder } from '../field/field.placeholder';

import { usePlaceholderAnimation, useRowAnimation } from './row.animations';
import { useRowCellDrop } from './row.cell-drop';
import { useRowDimensions } from './row.dimensions';
import { useRowDrop } from './row.drop';
import {
  DropZone,
  DropZoneAnimation,
  RowFieldsContainer,
  RowWrapper,
} from './row.styles';

type Props = {
  row: RowType;
};

export const Row: React.FC<Props> = ({ row }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fields = useSelector(fieldSelectors.inRow(row));

  const [width, offsetX] = useRowDimensions(wrapperRef);

  const { ref: rowDropRef, isOver: isOverRow } = useRowDrop(row);
  const placeholderAnimation = usePlaceholderAnimation(isOverRow);
  const rowAnimation = useRowAnimation(isOverRow);

  const {
    ref: fieldDropRef,
    isOver,
    isCurrentRow,
    isDraggingCell,
    dragCellIndex,
    hoverPosition,
    cellWidth,
  } = useRowCellDrop(wrapperRef, row, fields.length, width, offsetX);

  const ref = fieldDropRef(
    wrapperRef
  ) as unknown as MutableRefObject<HTMLDivElement>;

  return (
    <RowWrapper ref={ref}>
      <DropZone ref={rowDropRef}>
        <DropZoneAnimation style={placeholderAnimation} />
      </DropZone>
      <RowFieldsContainer style={rowAnimation}>
        <FieldDragPlaceholder
          isActive={isOver}
          hoverPosition={hoverPosition}
          cellWidth={cellWidth}
        />
        {fields.map((field, idx) => (
          <Field
            field={field}
            isOver={isOver}
            hoverPosition={hoverPosition}
            isCurrentRow={isCurrentRow}
            isDraggingCell={isDraggingCell}
            dragCellIndex={dragCellIndex}
            index={idx}
            key={field.uid}
            width={cellWidth || width}
          />
        ))}
      </RowFieldsContainer>
    </RowWrapper>
  );
};
