import type { FC } from 'react';
import React from 'react';
import { FormComponent } from '@components/form-controls';
import FormLabel from '@components/form-controls/label';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import { FlexColumn } from '@components/layout/blocks/flex';
import type { Field } from '@editor/store/slices/layout/fields';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import {
  type OptionsProperty,
  PropertyType,
} from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import {
  NoContent,
  PreviewData,
  PreviewRow,
  PreviewTable,
  PreviewWrapper,
} from '../../../table/table.preview.styles';
import type { OptionsConfiguration } from '../../options.types';
import { useOptionTypesElements } from '../configurable/elements/elements.queries';

import { OptionsTranslationsEditor } from './translations.editor';
import type { ElementTranslations } from './translations.types';

type Props = {
  value: OptionsConfiguration;
  defaultValue: string | string[];
  isMultiple: boolean;
  field: Field;
  property: OptionsProperty;
};

export const SourceElements: FC<Props> = ({
  value,
  defaultValue,
  isMultiple,
  field,
  property,
}) => {
  const {
    hasTranslation,
    getTranslation,
    removeTranslation,
    updateTranslation,
  } = useTranslations(field);

  if (value.source !== 'elements') {
    return null;
  }

  const { handle } = property;

  const { data } = useOptionTypesElements();
  const typeClass = value.typeClass;
  const typeProvider = data?.find((type) => type.typeClass === typeClass);

  const translation = getTranslation<ElementTranslations>(handle, {});
  const emptyOption: string = translation.emptyOption || '';

  return (
    <FlexColumn>
      {property.showEmptyOption && (
        <FormComponent
          property={{
            type: PropertyType.String,
            label: 'Empty Option Label (optional)',
            handle: 'emptyOption',
          }}
          context={value}
          value={emptyOption}
          updateValue={(currentValue) => {
            updateTranslation(handle, {
              ...translation,
              emptyOption: currentValue as string,
            });
          }}
        />
      )}
    </FlexColumn>
  );

  return (
    <>
      <FormLabel
        label="Options"
        handle={handle}
        translatable
        hasTranslation={hasTranslation(handle)}
        removeTranslation={() => removeTranslation(handle)}
      />
      <PreviewableComponent
        preview={
          <PreviewWrapper>
            <PreviewTable>
              {!options.length && (
                <NoContent>{translate('Not configured yet')}</NoContent>
              )}
              {options.map((option, index) => (
                <PreviewRow key={index}>
                  <PreviewData data-empty={translate('empty')}>
                    {optionTranslations.find(
                      (opt) => opt.value === option.value
                    )?.label || option.label}
                  </PreviewData>
                  <PreviewData className="code" data-empty={translate('empty')}>
                    {option.value}
                  </PreviewData>
                </PreviewRow>
              ))}
            </PreviewTable>
          </PreviewWrapper>
        }
        excludeClassNames={['bulk-editor']}
      >
        <OptionsTranslationsEditor
          value={value}
          defaultValue={defaultValue}
          isMultiple={isMultiple}
          field={field}
          property={property}
        />
      </PreviewableComponent>
    </>
  );
};
