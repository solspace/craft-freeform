import React from 'react';
import translate from '@ff-client/utils/translations';

import { Label } from '../../../control.styles';
import { PreviewableComponent } from '../../../preview/previewable-component';
import type { CustomOptions } from '../../options.types';

import { CustomEditor } from './custom.editor';
import { addOption, cleanOptions } from './custom.operations';
import { CustomPreview } from './custom.preview';

type Props = {
  value: CustomOptions;
  updateValue: (value: CustomOptions) => void;
};

const Custom: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <>
      <Label>{translate('Options')}</Label>
      <PreviewableComponent
        preview={<CustomPreview value={value} />}
        onEdit={() => {
          if (!value.options.length) {
            updateValue(addOption(value));
          }
        }}
        onAfterEdit={() => updateValue(cleanOptions(value))}
      >
        <CustomEditor value={value} updateValue={updateValue} />
      </PreviewableComponent>
    </>
  );
};

export default Custom;
