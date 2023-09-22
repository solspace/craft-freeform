import React from 'react';
import {
  ControlWrapper,
  Label,
} from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import type { ControlType } from '@components/form-controls/types';
import { useFieldOptions } from '@components/options/use-field-options';
import { useAppDispatch } from '@editor/store';
import { type Field, fieldActions } from '@editor/store/slices/layout/fields';
import { useFieldType } from '@ff-client/queries/field-types';
import type { OptionsProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { generateDefaultValue } from './sources/defaults';
import { SourceComponent } from './sources/source.component';
import { Button, ButtonGroup } from './options.styles';
import type { Option } from './options.types';
import { Source } from './options.types';
import { sourceLabels } from './options.types';

const Options: React.FC<ControlType<OptionsProperty, Field>> = ({
  value,
  errors,
  property,
  updateValue,
  context,
}) => {
  const { source } = value;
  const defaultValue: string | string[] = context.properties.defaultValue;

  const fieldType = useFieldType(context.typeClass);
  const isMultiple = fieldType?.implements.includes('multiValue');

  const [options] = useFieldOptions(context, fieldType);
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

  const convertToCustomValues = (): void =>
    updateValue({
      source: Source.Custom,
      useCustomValues: true,
      options: [...options] as Option[],
    });

  return (
    <>
      <ControlWrapper $width={property.width}>
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
        convertToCustomValues={convertToCustomValues}
        isMultiple={isMultiple}
      />

      <FormErrorList errors={errors} />
    </>
  );
};

export default Options;
