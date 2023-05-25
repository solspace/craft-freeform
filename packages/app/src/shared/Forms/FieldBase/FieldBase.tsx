import { classes } from '@ff-app/utils/classes';
import { createId } from '@ff-app/utils/html-attributes';
import translate from '@ff-app/utils/translations';
import React, { PropsWithChildren } from 'react';

export interface FieldProps {
  label?: string;
  name: string;
  instructions?: string;
  required?: boolean;
  errors?: string[];
}

const FieldBase: React.FC<PropsWithChildren<FieldProps>> = ({
  name,
  label,
  instructions,
  required,
  errors,
  children,
}) => {
  return (
    <div className="field width-100">
      {label && (
        <div className="heading">
          <label htmlFor={createId(name)} className={classes(required && 'required')} role="heading">
            {translate(label)}
          </label>
        </div>
      )}
      {instructions && (
        <div className="instructions">
          <p>{translate(instructions)}</p>
        </div>
      )}
      <div className={classes('input', 'ltr', errors && 'errors')}>{children}</div>
      {errors && (
        <ul className="errors">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FieldBase;
