import type { PropsWithChildren } from 'react';
import React from 'react';
import type { Property } from '@ff-client/types/properties';

import { ControlWrapper, Label } from './control.styles';

type Props = {
  property: Property;
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
