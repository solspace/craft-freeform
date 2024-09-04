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

import { FormErrorList } from './error-list';
import { FormMessageList } from './message-list';

type Props = {
  property: Property;
  errors?: string[];
};

export const Control: React.FC<PropsWithChildren<Props>> = ({
  children,
  property,
  errors,
}) => {
  const {
    label,
    handle,
    required,
    instructions,
    width,
    disabled,
    translatable,
  } = property;

  return (
    <ControlWrapper
      className={classes(!!errors && 'errors', disabled && 'disabled')}
      $width={width}
    >
      <FormLabel
        label={label}
        handle={handle}
        required={required}
        translatable={translatable}
      />
      <FormInstructions instructions={instructions} />
      <FormField>{children}</FormField>
      <FormErrorList errors={errors} />
      <FormMessageList messages={property.messages} />
    </ControlWrapper>
  );
};
