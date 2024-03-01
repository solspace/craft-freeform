import type { InputHTMLAttributes } from 'react';
import React from 'react';

import { CheckboxElement } from './checkbox.styles';

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox: React.FC<Props> = (props) => {
  return <CheckboxElement type="checkbox" {...props} />;
};
