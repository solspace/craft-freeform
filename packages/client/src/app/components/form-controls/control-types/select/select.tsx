import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type {
  Option,
  OptionCollection,
  SelectProperty,
} from '@ff-client/types/properties';

const renderOption = (
  option: Option | OptionCollection,
  index: number
): React.ReactNode => {
  if ('children' in option) {
    return (
      <optgroup label={option.label}>
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
}) => {
  const { handle, options, emptyOption } = property;

  return (
    <Control property={property} errors={errors}>
      <select
        id={handle}
        value={value ?? ''}
        className="text fullwidth"
        onChange={(event) => updateValue(event.target.value)}
      >
        {!!emptyOption && <option value="" label={emptyOption} />}

        {options?.map(renderOption)}
      </select>
    </Control>
  );
};

export default Select;
