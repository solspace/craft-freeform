import React, { useEffect, useState } from 'react';
import { useRenderContext } from '@components/form-controls/context/render.context';
import { Control } from '@components/form-controls/control';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import { useDebounce } from '@ff-client/hooks/use-debounce';
import type { AttributeProperty } from '@ff-client/types/properties';
import isEqual from 'lodash/isEqual';

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

  const debouncedValue = useDebounce(editableAttributes, 1000);

  // When local edits settle, sync back to redux only if the converted value changed
  useEffect(() => {
    const next = convertFromEditable(debouncedValue);
    if (!isEqual(next, attributes)) {
      updateValue(next);
    }
  }, [debouncedValue]);

  // Only update local editable state if incoming props actually changed
  useEffect(() => {
    const incoming = convertToEditable(attributes);
    if (!isEqual(incoming, editableAttributes)) {
      setEditableAttributes(incoming);
    }
  }, [attributes]);

  const preview = (
    <PreviewableComponent
      preview={
        <AttributePreview property={property} attributes={editableAttributes} />
      }
      onAfterEdit={() => {
        const cleaned = convertFromEditable(
          cleanAttributes(editableAttributes)
        );

        if (!isEqual(cleaned, attributes)) {
          updateValue(cleaned);
        }
      }}
    >
      <AttributesEditor
        property={property}
        attributes={editableAttributes}
        updateValue={setEditableAttributes}
      />
    </PreviewableComponent>
  );

  if (size === 'small') {
    return preview;
  }

  return <Control property={property}>{preview}</Control>;
};

export default Attributes;
