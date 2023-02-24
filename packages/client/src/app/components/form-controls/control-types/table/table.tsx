import React from 'react';
import { Control } from '@components/form-controls/control';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';

import { TableEditor } from './table.editor';
import { addColumn, cleanColumns } from './table.operations';
import { TablePreview } from './table.preview';
import type { ColumnDescription } from './table.types';

const Table: React.FC<ControlType<ColumnDescription[]>> = ({
  value: columns,
  property,
  updateValue,
}) => {
  const { options: columnTypes } = property;

  return (
    <Control property={property}>
      <PreviewableComponent
        preview={<TablePreview columnTypes={columnTypes} columns={columns} />}
        onEdit={() => {
          if (!columns.length) {
            updateValue(addColumn(columns));
          }
        }}
        onAfterEdit={() => updateValue(cleanColumns(columns))}
      >
        <TableEditor
          columnTypes={columnTypes}
          columns={columns}
          updateValue={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default Table;
