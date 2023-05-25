import React from 'react';

import { createId } from '@ff-app/utils/html-attributes';

import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';

import type { FieldProps } from '../FieldBase/FieldBase';
interface Props extends FieldProps {
  onChange?: ChangeHandler;
  value?: string;
}

const Text = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { name, onChange, value } = props;

  return (
    <FieldBase {...props}>
      <input
        ref={ref}
        id={createId(name)}
        name={name}
        type="text"
        className="text fullwidth"
        onChange={({ target: { value } }): void => onChange(value)}
        value={value}
      />
    </FieldBase>
  );
});

Text.displayName = 'Text';

export default Text;
