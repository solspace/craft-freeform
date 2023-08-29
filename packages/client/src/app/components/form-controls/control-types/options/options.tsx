import React from 'react';
import {
  ControlWrapper,
  Label,
} from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import type { ControlType } from '@components/form-controls/types';
import type { OptionsProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { generateDefaultValue } from './sources/defaults';
import { SourceComponent } from './sources/source.component';
import { Button, ButtonGroup } from './options.styles';
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
        <ButtonGroup>
          {Object.entries(sourceLabels).map(([key, label]) => (
            <Button
              key={key}
              className={classes(source === key && 'active')}
              onClick={() => updateValue(generateDefaultValue(key as Source))}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </ControlWrapper>

      <SourceComponent value={value} updateValue={updateValue} />

      <FormErrorList errors={errors} />
    </>
  );
};

export default Options;
