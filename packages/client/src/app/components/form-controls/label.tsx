import React from 'react';

import { Label } from './control.styles';

type Props = {
  label: string;
  handle: string;
};

const FormLabel: React.FC<Props> = ({ label, handle }) => {
  if (!label) {
    return null;
  }

  return <Label htmlFor={handle}>{label}</Label>;
};

export default FormLabel;
