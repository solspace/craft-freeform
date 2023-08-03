import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type {
  Option,
  OptionGroup,
  SelectProperty,
} from '@ff-client/types/properties';

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

const Select: React.FC<ControlType<SelectProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
}) => {
  const { handle, options, emptyOption } = property;

  return (
    <Control property={property} errors={errors}>
      <div className="select fullwidth">
        <select
          id={handle}
          value={value ?? ''}
          autoFocus={autoFocus}
          onChange={(event) => updateValue(event.target.value)}
        >
          {!!emptyOption && <option value="" label={emptyOption} />}

          {options?.map(renderOption)}
        </select>
      </div>
    </Control>
  );
};

export default Select;
