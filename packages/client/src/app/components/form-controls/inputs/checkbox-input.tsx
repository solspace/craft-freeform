import React from 'react';

type Props = {
  id: string;
  label?: string;
  checked?: boolean;
  onClick?: () => void;
};

export const CheckboxInput: React.FC<Props> = ({
  id,
  label,
  checked,
  onClick,
}) => {
  return (
    <div className="checkbox-wrapper">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        className="checkbox"
        onClick={onClick}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
