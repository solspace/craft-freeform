import type { HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

type Props = {
  label?: string;
} & HTMLAttributes<HTMLDivElement>;

export const Field: React.FC<PropsWithChildren<Props>> = ({
  children,
  label,
  ...props
}) => {
  return (
    <div className="field" {...props}>
      {label && (
        <div className="heading">
          <label htmlFor="">{label}</label>
        </div>
      )}
      <div className="input">{children}</div>
    </div>
  );
};
