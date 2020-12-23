import React from 'react';
import FieldContainer, { FieldContainerProps } from '../FieldContainer/FieldContainer';

interface Option<T extends string> {
  value: T;
  label: string;
}

export type Options<T extends string = string> = Option<T>[];

interface Props extends FieldContainerProps {
  value: string;
  options: Options;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField: React.FC<Props> = ({ description, options, value, onChange }) => {
  return (
    <FieldContainer description={description}>
      <div className="select fullwidth">
        <select value={value} onChange={onChange} className="fullwidth">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </FieldContainer>
  );
};

export default SelectField;
