import React from 'react';
import {
  ControlWrapper,
  Label,
} from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import type { ControlType } from '@components/form-controls/types';
import type { OptionsProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import { generateDefaultValue } from './sources/defaults';
import { SourceComponent } from './sources/source.component';
import type { Source } from './options.types';
import { Options, sourceLabels } from './options.types';

const Options: React.FC<ControlType<OptionsProperty>> = ({
  value,
  errors,
  updateValue,
}) => {
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

      <FormErrorList errors={errors} />
    </>
  );
};

export default Options;
