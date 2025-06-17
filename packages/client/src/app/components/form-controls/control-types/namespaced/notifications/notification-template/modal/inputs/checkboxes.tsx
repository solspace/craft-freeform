import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ControlBlock } from '@components/form-controls/control.block';
import {
  CheckboxesWrapper,
  SelectAllWrapper,
} from '@components/form-controls/control-types/checkboxes/checkboxes.styles';
import FormInstructions from '@components/form-controls/instructions';
import type { Option, OptionCollection } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import type { InputControl } from '../template.modal.types';

export const CheckboxesInput: FC<InputControl> = (props) => {
  const { optionDefinition, handle, value, onChange } = props;

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<OptionCollection>([]);

  const isAllSelected = value.length === options.length;

  useEffect(() => {
    if (typeof optionDefinition === 'function') {
      setLoading(true);
      optionDefinition()
        .then((data) => {
          setOptions(data);
        })
        .finally(() => setLoading(false));
    } else {
      setOptions(optionDefinition || []);
    }
  }, [optionDefinition]);

  return (
    <ControlBlock {...props}>
      {options.length > 0 && (
        <SelectAllWrapper>
          <input
            id={`${handle}-all`}
            type="checkbox"
            className="checkbox"
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) {
                onChange([]);
              } else {
                onChange(
                  options
                    .filter((option) => !('children' in option))
                    .map((option) => (option as Option).value)
                );
              }
            }}
          />
          <label htmlFor={`${handle}-all`}>{translate('Select All')}</label>
        </SelectAllWrapper>
      )}

      {!loading && options.length === 0 && (
        <>
          <SelectAllWrapper />
          <FormInstructions
            instructions={translate('No PDF templates were found')}
          />
        </>
      )}

      <CheckboxesWrapper $columns={1}>
        {loading && (
          <>
            <Skeleton width={100} height={15} />
            <Skeleton width={150} height={15} />
            <Skeleton width={170} height={15} />
            <Skeleton width={130} height={15} />
          </>
        )}

        {options.map((option) => {
          if ('children' in option) {
            return null;
          }

          const id = `${handle}-${option?.label}`;

          return (
            <div key={option.value} title={option.label}>
              <input
                id={id}
                type="checkbox"
                className="checkbox"
                checked={value.includes(option.value)}
                onChange={() => {
                  if (value.includes(option.value)) {
                    onChange(value.filter((v: string) => v !== option.value));
                  } else {
                    onChange([...value, option.value]);
                  }
                }}
              />
              <label htmlFor={id}>{option.label}</label>
            </div>
          );
        })}
      </CheckboxesWrapper>
    </ControlBlock>
  );
};
