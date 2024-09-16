import type { HTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

type Props = {
  label?: string;
  instructions?: string;
} & HTMLAttributes<HTMLDivElement>;

export const Field: React.FC<PropsWithChildren<Props>> = ({
  children,
  label,
  instructions,
  ...props
}) => {
  return (
    <div {...props} className={classes('field', props.className)}>
      {label && (
        <div className="heading">
          <label htmlFor="">{label}</label>
        </div>
      )}
      {instructions && <div className="instructions">{instructions}</div>}
      <div className="input">{children}</div>
    </div>
  );
};
