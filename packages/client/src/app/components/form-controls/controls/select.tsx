import type { ChangeEvent } from 'react';
import React from 'react';

import type { ControlProps, OptionProps } from '../control';
import { Control } from '../control';

export const SelectBox: React.FC<ControlProps<string | number>> = (
  props: ControlProps<string | number>
) => {
  const { id, value, options, onChange } = props;

  return (
    <Control {...props}>
      <select
        id={id}
        defaultValue={value}
        className="text fullwidth"
        onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
          onChange && onChange(event.target.value)
        }
      >
        {options.map((option: OptionProps, index: number) => (
          <option key={index} value={option.value} label={option.label} />
        ))}
      </select>
    </Control>
  );
};
