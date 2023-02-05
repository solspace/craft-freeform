import React from 'react';
import type { OptionsEditorProps } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-editor.types';
import {
  H3,
  Wrapper,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-preview.styles';
import optionsSources from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-sources';
import { InputPreview } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table.editor.styles';
import translate from '@ff-client/utils/translations';

type Props = {
  value: OptionsEditorProps;
};

const getSourceLabel = (key: string): string => {
  const optionSource = optionsSources.find(
    (optionSource) => optionSource.key === key
  );

  return optionSource ? optionSource.label : key;
};

const OptionsPreview: React.FC<Props> = ({ value }) => {
  const source = value?.source || '';

  return (
    <Wrapper>
      <H3>Source</H3>
      <InputPreview
        readOnly
        type="text"
        className="with-border"
        defaultValue={getSourceLabel(source)}
        placeholder={translate('Choose Source')}
      />
    </Wrapper>
  );
};

export default OptionsPreview;
