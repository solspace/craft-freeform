import type { ChangeEvent } from 'react';
import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';

export const Color: React.FC<ControlProps<string>> = ({
  id,
  value,
  label,
  onChange,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    <input
      id={id}
      type="color"
      style={{
        border: 0,
        margin: 0,
        padding: 0,
        height: '30px',
        backgroundColor: 'transparent',
      }}
      defaultValue={(value as string) || '#ff0000'}
      onChange={(event: ChangeEvent<HTMLInputElement>): void =>
        onChange && onChange(event.target.value)
      }
    />
  </Control>
);
