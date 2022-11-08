import type { ReactNode } from 'react';
import React from 'react';
import type { FormTagAttributeProps } from '@ff-client/types/properties';

import { Field, FieldHeading, FieldInstructions } from './control.styles';

export type OptionProps = {
  label: string;
  value: string | number;
};

export type ControlProps<T = unknown> = {
  id?: string;
  label?: string;
  rows?: number;
  options?: OptionProps[];
  instructions?: string;
  placeholder?: string;
  children?: ReactNode;
  value?: T;
  onChange?: (
    value: string | number | boolean | FormTagAttributeProps[]
  ) => void;
};

export const Control: React.FC<ControlProps> = ({
  id,
  label,
  instructions,
  children,
}) => (
  <Field className="field">
    {!!label && (
      <FieldHeading>
        <label htmlFor={id}>{label}</label>
      </FieldHeading>
    )}
    {!!instructions && <FieldInstructions>{instructions}</FieldInstructions>}
    <div className="input">{children}</div>
  </Field>
);
