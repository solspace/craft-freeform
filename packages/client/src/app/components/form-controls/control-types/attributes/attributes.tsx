import React from 'react';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { AttributeProperty } from '@ff-client/types/properties';

import { AttributesEditor } from './attributes.editor';
import { cleanAttributes } from './attributes.operations';
import { AttributePreview } from './attributes.preview';

const Attributes: React.FC<ControlType<AttributeProperty>> = ({
  value: attributes,
  updateValue,
}) => {
  return (
    <PreviewableComponent
      preview={<AttributePreview attributes={attributes} />}
      onAfterEdit={() => {
        updateValue(cleanAttributes(attributes));
      }}
    >
      <AttributesEditor attributes={attributes} updateValue={updateValue} />
    </PreviewableComponent>
  );
};

export default Attributes;
