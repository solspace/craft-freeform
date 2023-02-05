import React from 'react';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';

import { Control } from '../control';
import { PreviewableComponent } from '../preview/previewable-component';

import { TableEditor } from './table.editor';
import { TablePreview } from './table.preview';
import type { ColumnDescription } from './table.types';

const Table: React.FC<ControlType<ColumnDescription[]>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle, options: columnTypes } = property;
  const { properties } = field;

  const columns = properties[handle];

  return (
    <Control property={property}>
      <PreviewableComponent
        preview={<TablePreview columnTypes={columnTypes} columns={columns} />}
      >
        <TableEditor
          columnTypes={columnTypes}
          columns={columns}
          onChange={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default Table;
