import type { ChangeEvent } from 'react';
import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';

export const Textarea: React.FC<ControlProps> = (props: ControlProps) => {
  const { id, rows, value, placeholder, onChange } = props;

  return (
    <Control {...props}>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className="text fullwidth"
        defaultValue={value as string}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
          onChange && onChange(event.target.value)
        }
      />
    </Control>
  );
};
