import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { ControlType } from '@components/form-controls/types';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import type { CalculationProperty } from '@ff-client/types/properties';
import type Tagify from '@yaireo/tagify';
import { MixedTags } from '@yaireo/tagify/dist/react.tagify';

import { Control } from '../../control';

import { CalculationBoxWrapper } from './calculation-box.styles';

import '@yaireo/tagify/dist/tagify.css';

const CalculationBox: React.FC<ControlType<CalculationProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const [calculationBoxValue, setCalculationBoxValue] = useState('');
  const allFields = useSelector(fieldSelectors.all);
  const handles = allFields
    .filter((item) => property.availableFieldTypes.includes(item.typeClass))
    .map((item) => item.properties.handle);

  const generateValue = (value: string): string => {
    return value.replace(
      /field:([a-zA-Z0-9_]+)/g,
      (_, variable) => `[[${variable}]]`
    );
  };

  const onChange = useCallback(
    (e: CustomEvent<Tagify.ChangeEventData<Tagify.TagData>>) => {
      const getValue = e.detail.tagify.DOM.input.textContent;

      updateValue(getValue);
    },
    []
  );

  useEffect(() => {
    setCalculationBoxValue(generateValue(value));
  }, []);

  return (
    <Control property={property} errors={errors}>
      <CalculationBoxWrapper>
        <MixedTags
          autoFocus={false}
          settings={{
            pattern: /@|{/,
            mixTagsInterpolator: ['[', ']'],
            enforceWhitelist: true,
            editTags: false,
            pasteAsTags: true,
            dropdown: {
              enabled: 0,
              position: 'text',
              includeSelectedTags: true,
            },
            templates: {
              tag: function (tagData) {
                return `
                <tag
                  title="${tagData.value}"
                  contenteditable="false"
                  spellcheck="false"
                  class="tagify__tag"
                  ${this.getAttributes(tagData)}
                >
                <x title="remove tag" class="tagify__tag__removeBtn"></x>
                  <div>
                    <p class="tagify__tag-text">
                      <span class="sr-only-value">${' '}field:</span>${
                        tagData.value
                      }${' '}</p>
                  </div>
                </tag>`;
              },
            },
            whitelist: handles,
          }}
          onChange={onChange}
          value={calculationBoxValue}
        />
      </CalculationBoxWrapper>
    </Control>
  );
};

export default CalculationBox;
