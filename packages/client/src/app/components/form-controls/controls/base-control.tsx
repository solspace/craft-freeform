import type { PropsWithChildren } from 'react';
import React from 'react';
import type { Property } from '@ff-client/types/properties';

import { Field, FieldHeading, FieldInstructions } from './base-control.styles';

export type ControlProps = {
  property: Property;
};

export const BaseControl: React.FC<PropsWithChildren<ControlProps>> = ({
  property,
  children,
}) => {
  const { label, handle, instructions } = property;

  return (
    <Field className="field">
      {!!label && (
        <FieldHeading>
          <label htmlFor={handle}>{label}</label>
        </FieldHeading>
      )}
      {!!instructions && <FieldInstructions>{instructions}</FieldInstructions>}
      <div className="input">{children}</div>
    </Field>
  );
};
