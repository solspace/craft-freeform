import type { ChangeEvent } from 'react';
import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';

export const Textarea: React.FC<ControlProps<string>> = ({
  id,
  rows,
  value,
  label,
  onChange,
  placeholder,
  instructions,
}) => (
  <Control id={id} label={label} instructions={instructions}>
    <textarea
      id={id}
      rows={rows}
      placeholder={placeholder}
      className="text fullwidth"
      defaultValue={(value as string) || ''}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
        onChange && onChange(event.target.value)
      }
    />
  </Control>
);
