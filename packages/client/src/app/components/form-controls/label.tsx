import React from 'react';
import classes from '@ff-client/utils/classes';

import { Label } from './control.styles';

type Props = {
  label: string;
  handle: string;
  required?: boolean;
};

const FormLabel: React.FC<Props> = ({ label, handle, required }) => {
  if (!label) {
    return null;
  }

  return (
    <Label className={classes(required && 'is-required')} htmlFor={handle}>
      {label}
    </Label>
  );
};

export default FormLabel;
