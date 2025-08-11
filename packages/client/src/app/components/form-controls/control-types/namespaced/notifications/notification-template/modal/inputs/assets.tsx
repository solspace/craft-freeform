import type { FC } from 'react';
import React from 'react';
import { CraftAssetPicker } from '@components/elements/craft-asset-picker/craft-asset-picker';
import { ControlBlock } from '@components/form-controls/control.block';

import type { InputControl } from '../template.modal.types';

export const AssetsInput: FC<InputControl> = (props) => {
  const { value, onChange } = props;

  return (
    <ControlBlock {...props}>
      <CraftAssetPicker
        criteria={{ kind: [] }}
        multiSelect={true}
        onUpdate={onChange}
        value={value}
      />
    </ControlBlock>
  );
};
