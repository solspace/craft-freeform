import React from 'react';
import translate from '@ff-client/utils/translations';

import { Label } from '../../../control.styles';
import { PreviewableComponent } from '../../../preview/previewable-component';
import type { CustomOptions } from '../../options.types';

import { CustomEditor } from './custom.editor';
import { CustomPreview } from './custom.preview';

type Props = {
  value: CustomOptions;
  updateValue: (value: CustomOptions) => void;
};

const Custom: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <>
      <Label>{translate('Options')}</Label>
      <PreviewableComponent preview={<CustomPreview value={value} />}>
        <CustomEditor value={value} updateValue={updateValue} />
      </PreviewableComponent>
    </>
  );
};

export default Custom;
