import React from 'react';

type Props = {
  id: string;
  label: string;
  onClick?: () => void;
};

export const CheckboxInput: React.FC<Props> = ({ id, label, onClick }) => {
  return (
    <div className="checkbox-wrapper">
      <input id={id} type="checkbox" className="checkbox" onClick={onClick} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
