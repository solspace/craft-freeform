import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { ControlBlock } from '@components/form-controls/control.block';

import type { InputControl } from '../template.modal.types';

export const DropdownInput: React.FC<InputControl> = (props) => {
  return (
    <ControlBlock {...props}>
      <Dropdown />
    </ControlBlock>
  );
};
