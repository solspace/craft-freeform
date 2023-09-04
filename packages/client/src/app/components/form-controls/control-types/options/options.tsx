import React from 'react';
import {
  ControlWrapper,
  Label,
} from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import type { ControlType } from '@components/form-controls/types';
import { useAppDispatch } from '@editor/store';
import { type Field, fieldActions } from '@editor/store/slices/layout/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import type { OptionsProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { generateDefaultValue } from './sources/defaults';
import { SourceComponent } from './sources/source.component';
import { Button, ButtonGroup } from './options.styles';
import type { Source } from './options.types';
import { sourceLabels } from './options.types';

const Options: React.FC<ControlType<OptionsProperty, Field>> = ({
  value,
  errors,
  updateValue,
  context,
}) => {
  const { source } = value;
  const defaultValue: string | string[] = context.properties.defaultValue;

  const fieldType = useFieldType(context.typeClass);
  const isMultiple = fieldType?.implements.includes('multiValue');

  const dispatch = useAppDispatch();
  const updateDefaultValue = (value: string | string[]): void => {
    dispatch(
      fieldActions.edit({
        uid: context.uid,
        handle: 'defaultValue',
        value,
      })
    );
  };

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

      <SourceComponent
        value={value}
        updateValue={updateValue}
        defaultValue={defaultValue}
        updateDefaultValue={updateDefaultValue}
        isMultiple={isMultiple}
      />

      <FormErrorList errors={errors} />
    </>
  );
};

export default Options;
