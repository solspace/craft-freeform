import type { ComponentType } from 'react';
import React from 'react';
import * as ControlTypes from '@editor/builder/tabs/layout-editor/property-editor/form-controls/custom';
import sourceOptions from '@editor/builder/tabs/layout-editor/property-editor/form-controls/source-options';
import type { GenericValue } from '@ff-client/types/properties';

import { Column, H3, Row, Wrapper } from './options-editor.styles';

type SourceTypes = typeof sourceOptions[number]['key'] | '';

type CustomControlProps = {
  handle: string;
  value: GenericValue;
  onChange: (value: GenericValue) => void;
};

type OptionsEditorProps = {
  source?: SourceTypes;
  options?: GenericValue;
};

type Props = {
  handle: string;
  value: OptionsEditorProps;
  onChange: (value: OptionsEditorProps) => void;
};

const sources: {
  [key in SourceTypes]?: ComponentType<CustomControlProps>;
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
  ) : null;

  return (
    <Wrapper>
      <Row>
        <Column>
          <H3>Source</H3>
          <select
            id="source"
            defaultValue={source}
            className="text fullwidth"
            onChange={(event) =>
              onChange({
                ...value,
                source: event.target.value as SourceTypes,
              })
            }
          >
            {Object.values(sourceOptions).map(({ key, label }) => (
              <option key={key} value={key} label={label} />
            ))}
          </select>
        </Column>
      </Row>
      {SourceTypeControl}
    </Wrapper>
  );
};

export default OptionsEditor;
