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
import { sourceLabels } from './options.types';

const Options: React.FC<ControlType<OptionsProperty>> = ({
  value,
  errors,
  updateValue,
}) => {
  const { source } = value;

  return (
    <>
      <ControlWrapper className="field">
        <Label>{translate('Source')}</Label>
        <ul>
          {Object.entries(sourceLabels).map(([key, label]) => (
            <li key={key}>
              <input
                type="radio"
                className="radio"
                value={key}
                checked={source === key}
                id={`source-${key}`}
                onChange={(event) =>
                  updateValue(
                    generateDefaultValue(event.target.value as Source)
                  )
                }
              />
              <label htmlFor={`source-${key}`}>{label}</label>
            </li>
          ))}
        </ul>
      </ControlWrapper>

      <SourceComponent value={value} updateValue={updateValue} />

      <FormErrorList errors={errors} />
    </>
  );
};

export default Options;
