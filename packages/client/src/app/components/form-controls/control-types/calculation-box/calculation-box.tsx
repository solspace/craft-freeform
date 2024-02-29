import React from 'react';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { CalculationProperty } from '@ff-client/types/properties';

import { Control } from '../../control';

import { CalculationBoxEditor } from './calculation-box.editor';
import { CalculationBoxPreview } from './calculation-box.preview';

import '@yaireo/tagify/dist/tagify.css';

const CalculationBox: React.FC<ControlType<CalculationProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  return (
    <Control property={property} errors={errors}>
      <PreviewableComponent preview={<CalculationBoxPreview value={value} />}>
        <CalculationBoxEditor
          value={value}
          property={property}
          updateValue={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default CalculationBox;
