import React from 'react';
import { Tooltip } from 'react-tippy';

import { Label } from './control.styles';

type Props = {
  label: string;
  handle: string;
  required?: boolean;
  title?: string;
};

const FormLabel: React.FC<Props> = ({ label, handle, required, title }) => {
  if (!label) {
    return null;
  }

  return (
    <Label htmlFor={handle}>
      {!title && label}
      {title && (
        <Tooltip title={title} position="top" animation="fade">
          {label}
        </Tooltip>
      )}
      {required && <span className="required" />}
    </Label>
  );
};

export default FormLabel;
