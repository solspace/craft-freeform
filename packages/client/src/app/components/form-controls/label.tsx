import React from 'react';
import { Tooltip } from 'react-tippy';
import classes from '@ff-client/utils/classes';

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
    <Label className={classes(required && 'is-required')} htmlFor={handle}>
      {!title && label}
      {title && (
        <Tooltip title={title} position="top" animation="fade">
          {label}
        </Tooltip>
      )}
    </Label>
  );
};

export default FormLabel;
