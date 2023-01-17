import type { ComponentType } from 'react';
import React from 'react';
import * as ControlTypes from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options';
import {
  H3,
  Wrapper,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-editor.styles';
import type {
  CustomControlProps,
  OptionsEditorProps,
  OptionsSources,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-editor.types';
import optionsSources from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-sources';

type Props = {
  handle: string;
  value: OptionsEditorProps;
  onChange: (value: OptionsEditorProps) => void;
};

const sources: {
  [key in OptionsSources]?: ComponentType<CustomControlProps>;
} = ControlTypes;

const OptionsEditor: React.FC<Props> = ({ handle, value, onChange }) => {
  const source = value?.source || '';
  const options = value?.options || [];

  const SourceType = sources[source];
  const SourceTypeControl = SourceType ? (
    <SourceType
      handle={handle}
      value={options}
      onChange={(options) =>
        onChange({
          ...value,
          options,
        })
      }
    />
  ) : (
    source && (
      <div style={{ marginTop: '10px' }}>{`...${source} <${source}>`}</div>
    )
  );

  return (
    <Wrapper>
      <H3>Source</H3>
      <select
        id="source"
        defaultValue={source}
        className="text fullwidth"
        onChange={(event) =>
          onChange({
            ...value,
            source: event.target.value as OptionsSources,
          })
        }
      >
        {Object.values(optionsSources).map(({ key, label }) => (
          <option key={key} value={key} label={label} />
        ))}
      </select>
      {SourceTypeControl}
    </Wrapper>
  );
};

export default OptionsEditor;
