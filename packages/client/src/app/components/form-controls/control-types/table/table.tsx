import { Control } from "@components/form-controls/control";
import { PreviewableComponent } from "@components/form-controls/preview/previewable-component";
import type { ControlType } from "@components/form-controls/types";
import type { Field } from "@editor/store/slices/layout/fields";
import type { TableProperty } from "@ff-client/types/properties";
import type React from "react";

import { TableEditor } from "./table.editor";
import { addColumn, cleanColumns } from "./table.operations";
import { TablePreview } from "./table.preview";

const Table: React.FC<ControlType<TableProperty, Field>> = ({
  value: columns,
  property,
  errors,
  updateValue,
  context,
}) => {
  const { options: columnTypes } = property;

  return (
    <Control property={property} errors={errors} context={context}>
      <PreviewableComponent
        preview={<TablePreview columnTypes={columnTypes} columns={columns} />}
        onAfterEdit={() => updateValue(cleanColumns(columns))}
        onEdit={() => {
          if (!columns.length) {
            updateValue(addColumn(columns, 0));
          }
        }}
      >
        <TableEditor
          columnTypes={columnTypes}
          columns={columns}
          updateValue={updateValue}
          property={property}
          context={context}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default Table;
