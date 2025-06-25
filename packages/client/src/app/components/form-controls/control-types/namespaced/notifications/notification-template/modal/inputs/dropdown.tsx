import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { ControlBlock } from '@components/form-controls/control.block';
import type { OptionCollection } from '@ff-client/types/properties';

import type { InputControl } from '../template.modal.types';

export const DropdownInput: FC<InputControl> = (props) => {
  const { optionDefinition, emptyOption, value, onChange } = props;

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<OptionCollection>([]);

  useEffect(() => {
    if (typeof optionDefinition === 'function') {
      setLoading(true);
      optionDefinition()
        .then((data) => {
          setOptions(data);
        })
        .finally(() => setLoading(false));
    } else {
      setOptions(optionDefinition || []);
    }
  }, [optionDefinition]);

  return (
    <ControlBlock {...props}>
      <Dropdown
        options={options}
        emptyOption={emptyOption}
        value={value}
        onChange={(value) => onChange(value)}
        loading={loading}
      />
    </ControlBlock>
  );
};
