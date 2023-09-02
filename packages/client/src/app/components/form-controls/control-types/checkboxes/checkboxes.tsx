import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type {
  CheckboxesProperty,
  Option,
  OptionGroup,
} from '@ff-client/types/properties';

import { CheckboxesWrapper, SelectAllWrapper } from './checkboxes.styles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
const renderOption = (
  option: Option | OptionGroup,
  index: number
): React.ReactNode => {
  if ('children' in option) {
    return (
      <optgroup key={option.label} label={option.label}>
        {option.children.map(renderOption)}
      </optgroup>
    );
  }

  return (
    <option key={index} value={option.value}>
      {option.label}
    </option>
  );
};

const Checkboxes: React.FC<ControlType<CheckboxesProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { handle, options, selectAll, columns } = property;
  const isAllSelected = value.length === options.length;

  return (
    <Control property={property} errors={errors}>
      {selectAll && (
        <SelectAllWrapper>
          <input
            id={`${handle}-all`}
            type="checkbox"
            className="checkbox"
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) {
                updateValue([]);
              } else {
                updateValue(
                  options
                    .filter((option) => !('children' in option))
                    .map((option) => (option as Option).value)
                );
              }
            }}
          />
          <label htmlFor={`${handle}-all`}>Select All</label>
        </SelectAllWrapper>
      )}

      <CheckboxesWrapper $columns={columns}>
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
                    updateValue(value.filter((v) => v !== option.value));
                  } else {
                    updateValue([...value, option.value]);
                  }
                }}
              />
              <label htmlFor={id}>{option.label}</label>
            </div>
          );
        })}
      </CheckboxesWrapper>
    </Control>
  );
};

export default Checkboxes;
