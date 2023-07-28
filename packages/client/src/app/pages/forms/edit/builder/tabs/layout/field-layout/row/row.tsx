import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import type { Row as RowType } from '@editor/builder/types/layout';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';

import { Field } from '../field/field';
import { FieldDragPlaceholder } from '../field/field.placeholder';

import { usePlaceholderAnimation, useRowAnimation } from './row.animations';
import { useRowDimensions } from './row.dimensions';
import { useRowDrop } from './row.drop';
import { useRowFieldDrop } from './row.field-drop';
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
    isDraggingField,
    dragFieldIndex,
    hoverPosition,
    fieldWidth,
  } = useRowFieldDrop(wrapperRef, row, fields.length, width, offsetX);

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
          fieldWidth={fieldWidth}
        />
        {fields.map((field, idx) => (
          <Field
            field={field}
            isOver={isOver}
            hoverPosition={hoverPosition}
            isCurrentRow={isCurrentRow}
            isDraggingField={isDraggingField}
            dragFieldIndex={dragFieldIndex}
            index={idx}
            key={field.uid}
            width={fieldWidth || width}
          />
        ))}
      </RowFieldsContainer>
    </RowWrapper>
  );
};
