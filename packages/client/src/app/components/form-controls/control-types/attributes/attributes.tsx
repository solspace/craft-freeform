import React, { useEffect, useState } from 'react';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { AttributeProperty } from '@ff-client/types/properties';

import { AttributesEditor } from './attributes.editor';
import { cleanAttributes } from './attributes.operations';
import { AttributePreview } from './attributes.preview';
import type {
  AttributeCollection,
  EditableAttributeCollection,
  InputAttributeTarget,
} from './attributes.types';

const convertToEditable = (
  value: AttributeCollection<InputAttributeTarget>
): EditableAttributeCollection => {
  const converted: EditableAttributeCollection = {};
  for (const key in value) {
    const typedKey: InputAttributeTarget = key as InputAttributeTarget;
    converted[typedKey] = Object.entries(value[key as InputAttributeTarget]);
  }

  return converted;
};

const convertFromEditable = (
  value: EditableAttributeCollection
): AttributeCollection<InputAttributeTarget> => {
  const converted: AttributeCollection<InputAttributeTarget> = {};
  for (const key in value) {
    const typedKey: InputAttributeTarget = key as InputAttributeTarget;
    converted[typedKey] = {};
    for (const [attrKey, attrValue] of value[key as InputAttributeTarget]) {
      converted[typedKey][attrKey] = attrValue;
    }
  }
  return converted;
};

const Attributes: React.FC<ControlType<AttributeProperty>> = ({
  value: attributes,
  updateValue,
}) => {
  const [editableAttributes, setEditableAttributes] = useState(
    convertToEditable(attributes)
  );

  useEffect(() => {
    setEditableAttributes(convertToEditable(attributes));
  }, [attributes]);

  return (
    <PreviewableComponent
      preview={<AttributePreview attributes={editableAttributes} />}
      onAfterEdit={() => {
        updateValue(convertFromEditable(cleanAttributes(editableAttributes)));
      }}
    >
      <AttributesEditor
        attributes={editableAttributes}
        updateValue={(value) => setEditableAttributes(value)}
      />
    </PreviewableComponent>
  );
};

export default Attributes;
