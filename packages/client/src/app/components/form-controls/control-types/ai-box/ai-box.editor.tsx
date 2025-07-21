import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { PreviewEditor } from '@components/form-controls/preview/previewable-component.styles';
import type { AiProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import type Tagify from '@yaireo/tagify';
import { MixedTags } from '@yaireo/tagify/dist/react.tagify.jsx';

import { useAiFieldHandles } from './ai-box.hooks';
import {
  FieldSelectionWrapper,
  PreviewTitle,
  TagMenu,
} from './field-selection.editor.styles';
import { generateValue } from './field-selection.hooks';

import '@yaireo/tagify/dist/tagify.css';

type Props = {
  value: string;
  property: AiProperty;
  updateValue: (value: string) => void;
};

type TagifyChangeEvent = CustomEvent<Tagify.ChangeEventData<Tagify.TagData>>;

const AiBoxEditor: React.FC<Props> = ({ value, property, updateValue }) => {
  const [fieldSelectionValue, setFieldSelectionValue] = useState('');

  const handles = useAiFieldHandles(property);
  const tagifyRef = useRef<Tagify>(null);

  const onChange = useCallback((event: TagifyChangeEvent): void => {
    updateValue(
      event.detail.tagify.DOM.input.textContent
        .replace(/\u200B/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }, []);

  const addTag = (value: string): void => {
    if (!value) {
      return;
    }

    const tagElm = tagifyRef.current.createTagElem({
      value,
    });

    tagifyRef.current.injectAtCaret(tagElm);
    const elm = tagifyRef.current.insertAfterTag(tagElm, '');
    tagifyRef.current.placeCaretAfterNode(elm);
  };

  useEffect(() => {
    setFieldSelectionValue(generateValue(value));
  }, []);

  return (
    <PreviewEditor>
      <PreviewTitle>
        <TagMenu>
          <Dropdown
            emptyOption={translate('Insert Field')}
            options={handles.map((handle: string) => ({
              value: handle,
              label: handle,
            }))}
            onChange={addTag}
            value=""
          />
        </TagMenu>

        <span>
          or type <mark>@</mark> to search on field handles
        </span>
      </PreviewTitle>
      <FieldSelectionWrapper>
        <MixedTags
          autoFocus={false}
          tagifyRef={tagifyRef}
          settings={{
            pattern: /@/,
            enforceWhitelist: true,
            editTags: false,
            pasteAsTags: true,
            duplicates: true,
            dropdown: {
              enabled: 0,
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
                      <span class="sr-only-value">field:</span>${
                        tagData.value
                      }</p>
                  </div>
                </tag>`;
              },
            },
            whitelist: handles,
          }}
          onChange={onChange}
          value={fieldSelectionValue}
        />
      </FieldSelectionWrapper>
    </PreviewEditor>
  );
};

export default AiBoxEditor;
