import type { ChangeEvent } from 'react';
import React from 'react';

import type { ControlProps } from '../control';
import { Control } from '../control';

export const Color: React.FC<ControlProps<string>> = (
  props: ControlProps<string>
) => {
  const { id, value, onChange } = props;

  return (
    <Control {...props}>
      <input
        id={id}
        type="color"
        defaultValue={value as string}
        onChange={(event: ChangeEvent<HTMLInputElement>): void =>
          onChange && onChange(event.target.value)
        }
      />
    </Control>
  );
};
