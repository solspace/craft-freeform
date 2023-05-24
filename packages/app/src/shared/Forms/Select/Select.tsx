import React from 'react';

import { createId } from '@ff-app/utils/html-attributes';
import translate from '@ff-app/utils/translations';

import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';

import type { FieldProps } from '../FieldBase/FieldBase';
export type SelectOption = {
  label: string;
  value?: string | number;
  children?: SelectOption[];
};

interface Props extends FieldProps {
  options: SelectOption[];
  onChange?: ChangeHandler;
  value?: string | number;
}

const renderOption = ({ label, value, children }: SelectOption, index: number): React.ReactNode => {
  if (children) {
    return (
      <optgroup key={`${index}-${label}`} label={translate(label)}>
        {children.map(renderOption)}
      </optgroup>
    );
  }

  return (
    <option key={`${index}-${value}`} value={value ?? ''}>
      {translate(label)}
    </option>
  );
};

const Select: React.FC<Props> = (props) => {
  const { name, onChange, value, options } = props;

  return (
    <FieldBase {...props}>
      <div className="select fullwidth">
        <select
          id={createId(name)}
          name={name}
          onChange={({ target: { value } }): void => onChange(value)}
          value={value}
        >
          {options.map(renderOption)}
        </select>
      </div>
    </FieldBase>
  );
};

export default Select;
