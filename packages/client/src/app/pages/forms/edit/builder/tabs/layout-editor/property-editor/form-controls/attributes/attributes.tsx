import React from 'react';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';

import { PreviewableComponent } from '../preview/previewable-component';

import { AttributePreview } from './attributes.preview';
import type { AttributeCollection } from './attributes.types';

const Attributes: React.FC<ControlType<AttributeCollection>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle } = property;
  const { properties } = field;

  const attributes: AttributeCollection = properties[handle];

  return (
    <PreviewableComponent
      preview={<AttributePreview attributes={attributes} />}
    >
      <div>Editor</div>
    </PreviewableComponent>
  );
};

export default Attributes;
