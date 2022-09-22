import React, { ReactNode } from 'react';

export type ControlProps<T = unknown> = {
  id?: string;
  label?: string;
  instructions?: string;
  children?: ReactNode;
  value?: T;
  onChange?: (value: T) => void;
};

export const Control: React.FC<ControlProps> = ({
  id,
  label,
  instructions,
  children,
}) => {
  return (
    <div className="field">
      {!!label && (
        <div className="heading">
          <label htmlFor={id}>{label}</label>
        </div>
      )}

      {!!instructions && <div className="instructions">{instructions}</div>}

      <div className="input">{children}</div>
    </div>
  );
};
