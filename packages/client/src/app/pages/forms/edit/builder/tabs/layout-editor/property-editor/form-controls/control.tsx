import type { PropsWithChildren } from 'react';
import React from 'react';
import type { Field } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import type { FieldProperty } from '@ff-client/types/fields';

import { ControlWrapper, Label } from './control.styles';

type Props = {
  field: Field;
  property: FieldProperty;
};

export const Control: React.FC<PropsWithChildren<Props>> = ({
  children,
  property,
}) => {
  return (
    <ControlWrapper>
      <Label htmlFor={property.handle}>{property.label}</Label>
      {children}
    </ControlWrapper>
  );
};
