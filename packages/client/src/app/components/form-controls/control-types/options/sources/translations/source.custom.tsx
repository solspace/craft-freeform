import type { FC } from 'react';
import React from 'react';
import FormLabel from '@components/form-controls/label';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import translate from '@ff-client/utils/translations';

import {
  NoContent,
  PreviewData,
  PreviewRow,
  PreviewTable,
  PreviewWrapper,
} from '../../../table/table.preview.styles';
import type { Option } from '../../options.types';

import type { TranslateOptionsProps } from './translations';
import { OptionsTranslationsEditor } from './translations.editor';
import type { OptionTranslations } from './translations.types';

export const SourceCustom: FC<TranslateOptionsProps> = ({
  value,
  defaultValue,
  isMultiple,
  field,
  property,
}) => {
  const { hasTranslation, getTranslation, removeTranslation } =
    useTranslations(field);

  if (value.source !== 'custom') {
    return null;
  }

  const { options } = value;
  const { handle } = property;

  const translation = getTranslation<OptionTranslations>(handle, {});
  const optionTranslations: Option[] = translation.options || [];

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
          <PreviewWrapper data-edit={translate('Click to edit data')}>
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
