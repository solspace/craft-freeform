import type { PropsWithChildren } from 'react';
import React from 'react';
import {
  ControlWrapper,
  FormField,
} from '@components/form-controls/control.styles';
import FormInstructions from '@components/form-controls/instructions';
import FormLabel from '@components/form-controls/label';
import type { Property } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import { useRenderContext } from './context/render.context';
import { FormErrorList } from './error-list';

type Props = {
  property: Property;
  errors?: string[];
};

export const Control: React.FC<PropsWithChildren<Props>> = ({
  children,
  property,
  errors,
}) => {
  const { size } = useRenderContext();
  const { label, handle, required, instructions, width, disabled } = property;

  return (
    <ControlWrapper
      className={classes(!!errors && 'errors', disabled && 'disabled')}
      $width={width}
    >
      <FormLabel
        label={label}
        handle={handle}
        required={required}
        title={size === 'small' && instructions}
      />
      {size === 'normal' && <FormInstructions instructions={instructions} />}
      <FormField>{children}</FormField>
      <FormErrorList errors={errors} />
    </ControlWrapper>
  );
};
