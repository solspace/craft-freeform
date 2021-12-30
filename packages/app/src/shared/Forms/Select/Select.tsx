import { createId } from '@ff-app/utils/html-attributes';
import translate from '@ff-app/utils/translations';
import React from 'react';

import type { FieldProps } from '../FieldBase/FieldBase';
import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';

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

const renderOption = ({ label, value, children }: SelectOption): React.ReactNode => {
  if (children) {
    return <optgroup label={translate(label)}>{children.map(renderOption)}</optgroup>;
  }

  return <option value={value ?? ''}>{translate(label)}</option>;
};

const Select: React.FC<Props> = (props) => {
  const { name, onChange, value, options } = props;

  return (
    <FieldBase {...props}>
      <div className="select fullwidth">
        <select
          id={createId(name)}
          name={name}
          onChange={({ target: { name, value } }): void => onChange(name, value)}
          value={value}
        >
          {options.map(renderOption)}
        </select>
      </div>
    </FieldBase>
  );
};

export default Select;
