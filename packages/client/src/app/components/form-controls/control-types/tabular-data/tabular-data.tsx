import React from 'react';
import { Control } from '@components/form-controls/control';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { TabularDataProperty } from '@ff-client/types/properties';

import { TabularDataEditor } from './tabular-data.editor';
import { addRow, cleanRows } from './tabular-data.operations';
import { TabularDataPreview } from './tabular-data.preview';

const Matrix: React.FC<ControlType<TabularDataProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { configuration } = property;

  return (
    <Control property={property} errors={errors}>
      <PreviewableComponent
        preview={
          <TabularDataPreview configuration={configuration} values={value} />
        }
        onAfterEdit={() => updateValue(cleanRows(value))}
        onEdit={() => {
          if (!value.length) {
            updateValue(addRow(value, configuration, 0));
          }
        }}
      >
        <TabularDataEditor
          configuration={configuration}
          values={value}
          updateValue={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default Matrix;
