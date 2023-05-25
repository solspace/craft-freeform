import { createId } from '@ff-app/utils/html-attributes';
import React from 'react';

import type { FieldProps } from '../FieldBase/FieldBase';
import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';
import { Handle, LightSwitch } from './Checkbox.styles';

export interface Props extends FieldProps {
  onClick?: ChangeHandler<boolean>;
  checked?: boolean;
}

const Checkbox: React.FC<Props> = (props) => {
  const { name, onClick, checked } = props;

  return (
    <FieldBase {...props}>
      <LightSwitch onClick={(): void => onClick(!checked)} className={checked ? 'on' : ''} role="checkbox">
        <Handle />
        <input id={createId(name)} type="hidden" name={name} value={checked ? '1' : '0'} />
      </LightSwitch>
    </FieldBase>
  );
};

export default Checkbox;
