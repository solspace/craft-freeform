import { createId } from '@ff-app/utils/html-attributes';
import React from 'react';

import type { FieldProps } from '../FieldBase/FieldBase';
import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';

interface Props extends FieldProps {
  onChange?: ChangeHandler;
  value?: string;
  rows?: number;
}

const DEFAULT_ROWS = 6;

const Textarea: React.FC<Props> = (props) => {
  const { name, onChange, value, rows = DEFAULT_ROWS } = props;

  return (
    <FieldBase {...props}>
      <textarea
        id={createId(name)}
        name={name}
        rows={rows}
        className="text fullwidth"
        onChange={({ target: { value } }): void => onChange(value)}
        value={value}
      />
    </FieldBase>
  );
};

export default Textarea;
