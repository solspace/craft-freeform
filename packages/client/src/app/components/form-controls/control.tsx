import type { PropsWithChildren } from 'react';
import React from 'react';
import {
  ControlWrapper,
  FormField,
} from '@components/form-controls/control.styles';
import FormInstructions from '@components/form-controls/instructions';
import FormLabel from '@components/form-controls/label';
import type { Property } from '@ff-client/types/properties';

type Props = {
  property: Property;
};

export const Control: React.FC<PropsWithChildren<Props>> = ({
  children,
  property,
}) => {
  return (
    <ControlWrapper>
      <FormLabel label={property.label} handle={property.handle} />
      <FormField>{children}</FormField>
      <FormInstructions instructions={property.instructions} />
    </ControlWrapper>
  );
};
