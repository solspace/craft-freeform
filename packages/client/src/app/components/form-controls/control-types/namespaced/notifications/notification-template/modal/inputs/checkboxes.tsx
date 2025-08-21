import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { Checkboxes } from '@components/elements/checkboxes/checkboxes';
import { SelectAllWrapper } from '@components/elements/checkboxes/checkboxes.styles';
import { ControlBlock } from '@components/form-controls/control.block';
import FormInstructions from '@components/form-controls/instructions';
import type { OptionCollection } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import type { InputControl } from '../template.modal.types';

export const CheckboxesInput: FC<InputControl> = (props) => {
  const { optionDefinition, handle, value, onChange } = props;

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
      <Checkboxes
        value={value}
        options={options}
        selectAll={options.length > 0}
        onUpdate={onChange}
        uniqueId={handle}
        emptyMessage={translate('No PDF templates were found')}
      />

      {!loading && options.length === 0 && (
        <>
          <SelectAllWrapper />
          <FormInstructions
            instructions={translate('No PDF templates were found')}
          />
        </>
      )}
    </ControlBlock>
  );
};
