import React from 'react';

import { Label } from './control.styles';

type Props = {
  label: string;
  handle: string;
};

const FormLabel: React.FC<Props> = ({ label, handle }) => (
  <Label htmlFor={handle}>{label}</Label>
);

export default FormLabel;
