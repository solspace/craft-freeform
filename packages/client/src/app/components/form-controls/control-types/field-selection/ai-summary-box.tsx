import React from 'react';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { FieldSelectionProperty } from '@ff-client/types/properties';

import { Control } from '../../control';

import { AiSummaryBoxPreview } from './ai-summary-box.preview';
import FieldSelectionEditor from './field-selection.editor';

const AiSummaryBox: React.FC<ControlType<FieldSelectionProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  return (
    <Control property={property} errors={errors}>
      <PreviewableComponent preview={<AiSummaryBoxPreview value={value} />}>
        <FieldSelectionEditor
          value={value}
          property={property}
          updateValue={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default AiSummaryBox;
