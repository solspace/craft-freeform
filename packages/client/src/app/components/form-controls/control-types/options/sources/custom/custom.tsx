import React from 'react';
import { Label } from '@components/form-controls/label.styles';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import translate from '@ff-client/utils/translations';

import type {
  ConfigurationProps,
  CustomOptionsConfiguration,
} from '../../options.types';

import { CustomEditor } from './custom.editor';
import { addOption, cleanOptions } from './custom.operations';
import { CustomPreview } from './custom.preview';

const Custom: React.FC<ConfigurationProps<CustomOptionsConfiguration>> = ({
  value,
  updateValue,
  property,
  defaultValue,
  updateDefaultValue,
  isMultiple,
}) => {
  return (
    <>
      <Label>{translate('Options')}</Label>
      <PreviewableComponent
        preview={
          <CustomPreview
            value={value}
            defaultValue={defaultValue}
            isMultiple={isMultiple}
          />
        }
        excludeClassNames={['bulk-editor']}
        onAfterEdit={() => updateValue(cleanOptions(value))}
        onEdit={() => {
          if (!value.options.length) {
            updateValue(addOption(value, 0));
          }
        }}
      >
        <CustomEditor
          value={value}
          updateValue={updateValue}
          property={property}
          defaultValue={defaultValue}
          updateDefaultValue={updateDefaultValue}
          isMultiple={isMultiple}
        />
      </PreviewableComponent>
    </>
  );
};

export default Custom;
