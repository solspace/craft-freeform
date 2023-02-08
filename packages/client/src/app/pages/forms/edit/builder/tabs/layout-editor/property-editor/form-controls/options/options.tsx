import React from 'react';
import type { ControlType } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/types';
import translate from '@ff-client/utils/translations';

import { ControlWrapper, Label } from '../control.styles';

import { generateDefaultValue } from './sources/defaults';
import { SourceComponent } from './sources/source.component';
import type { Source } from './options.types';
import { Options, sourceLabels } from './options.types';

const Options: React.FC<ControlType<Options>> = ({
  field,
  property,
  updateValue,
}) => {
  const { handle } = property;
  const { properties } = field;
  const value = properties[handle] as Options;
  const { source } = value;

  return (
    <>
      <ControlWrapper>
        <Label>{translate('Source')}</Label>
        <select
          id="source"
          defaultValue={source}
          className="text fullwidth"
          onChange={(event) =>
            updateValue(generateDefaultValue(event.target.value as Source))
          }
        >
          {Object.entries(sourceLabels).map(([key, label]) => (
            <option key={key} value={key} label={label} />
          ))}
        </select>
      </ControlWrapper>

      <SourceComponent value={value} updateValue={updateValue} />
    </>
  );
};

export default Options;
