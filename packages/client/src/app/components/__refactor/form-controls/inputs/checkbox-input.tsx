import React from 'react';

type Props = {
  id: string;
  label?: string;
  checked?: boolean;
  onChange?: () => void;
};

export const CheckboxInput: React.FC<Props> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="checkbox-wrapper">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        className="checkbox"
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
