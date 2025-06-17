import React from 'react';
import { ControlBlock } from '@components/form-controls/control.block';

import type { InputControl } from '../template.modal.types';

export const TextInput: React.FC<InputControl> = (props) => {
  const { value, multiline, onChange } = props;

  return (
    <ControlBlock {...props}>
      {multiline ? (
        <textarea
          rows={2}
          className="text fullwidth"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type="text"
          className="text fullwidth"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </ControlBlock>
  );
};
