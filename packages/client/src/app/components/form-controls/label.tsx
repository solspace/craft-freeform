import React from 'react';

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
    <Label htmlFor={handle}>
      {label}
      {required && <span className="required" />}
    </Label>
  );
};

export default FormLabel;
