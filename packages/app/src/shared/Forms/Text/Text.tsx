import { createId } from '@ff-app/utils/html-attributes';
import React from 'react';

import type { FieldProps } from '../FieldBase/FieldBase';
import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';

interface Props extends FieldProps {
  onChange?: ChangeHandler;
  value?: string;
}

const Text: React.FC<Props> = (props) => {
  const { name, onChange, value } = props;

  return (
    <FieldBase {...props}>
      <input
        id={createId(name)}
        name={name}
        type="text"
        className="text fullwidth"
        onChange={({ target: { name, value } }): void => onChange(name, value)}
        value={value}
      />
    </FieldBase>
  );
};

export default Text;
