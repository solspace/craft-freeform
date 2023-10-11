import React, { useEffect, useState } from 'react';
import { useRenderContext } from '@components/form-controls/context/render.context';
import { Control } from '@components/form-controls/control';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { AttributeProperty } from '@ff-client/types/properties';

import { AttributesEditor } from './attributes.editor';
import { cleanAttributes } from './attributes.operations';
import { AttributePreview } from './attributes.preview';
import type {
  AttributeCollection,
  EditableAttributeCollection,
} from './attributes.types';

const convertToEditable = (
  value: AttributeCollection
): EditableAttributeCollection => {
  const converted: EditableAttributeCollection = {};
  for (const key in value) {
    converted[key] = Object.entries(value[key]);
  }

  return converted;
};

const convertFromEditable = (
  value: EditableAttributeCollection
): AttributeCollection => {
  const converted: AttributeCollection = {};
  for (const key in value) {
    converted[key] = {};
    for (const [attrKey, attrValue] of value[key]) {
      converted[key][attrKey] = attrValue;
    }
  }
  return converted;
};

const Attributes: React.FC<ControlType<AttributeProperty>> = ({
  value: attributes,
  property,
  updateValue,
}) => {
  const { size } = useRenderContext();
  const [editableAttributes, setEditableAttributes] = useState(
    convertToEditable(attributes)
  );

  useEffect(() => {
    setEditableAttributes(convertToEditable(attributes));
  }, [attributes]);

  const preview = (
    <PreviewableComponent
      preview={
        <AttributePreview property={property} attributes={editableAttributes} />
      }
      onAfterEdit={() => {
        updateValue(convertFromEditable(cleanAttributes(editableAttributes)));
      }}
    >
      <AttributesEditor
        property={property}
        attributes={editableAttributes}
        updateValue={(value) => setEditableAttributes(value)}
      />
    </PreviewableComponent>
  );

  if (size === 'small') {
    return preview;
  }

  return <Control property={property}>{preview}</Control>;
};

export default Attributes;
