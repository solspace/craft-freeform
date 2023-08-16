import React from 'react';
import { Label } from '@components/form-controls/control.styles';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import translate from '@ff-client/utils/translations';

import type { CustomOptionsConfiguration } from '../../options.types';

import { CustomEditor } from './custom.editor';
import { addOption, cleanOptions } from './custom.operations';
import { CustomPreview } from './custom.preview';

type Props = {
  value: CustomOptionsConfiguration;
  updateValue: (value: CustomOptionsConfiguration) => void;
};

const Custom: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <>
      <Label>{translate('Options')}</Label>
      <PreviewableComponent
        preview={<CustomPreview value={value} />}
        onAfterEdit={() => updateValue(cleanOptions(value))}
        onEdit={() => {
          if (!value.options.length) {
            updateValue(addOption(value, 0));
          }
        }}
      >
        <CustomEditor value={value} updateValue={updateValue} />
      </PreviewableComponent>
    </>
  );
};

export default Custom;
