import React from 'react';
import { ControlBlock } from '@components/form-controls/control.block';

import type { InputControl } from '../template.modal.types';

export const TextInput: React.FC<InputControl> = (props) => {
  const multiline = props.multiline;

  return (
    <ControlBlock {...props}>
      {multiline ? (
        <textarea rows={2} className="text fullwidth" />
      ) : (
        <input type="text" className="text fullwidth" />
      )}
    </ControlBlock>
  );
};
