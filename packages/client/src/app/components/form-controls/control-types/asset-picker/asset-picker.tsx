import React from 'react';
import { CraftAssetPicker } from '@components/elements/craft-asset-picker/craft-asset-picker';
import type { ControlType } from '@components/form-controls/types';
import type { AssetPickerProperty } from '@ff-client/types/properties';

import { Control } from '../../control';

const AssetPicker: React.FC<ControlType<AssetPickerProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { criteria, multiSelect, actionLabel, limit } = property;

  return (
    <Control property={property} errors={errors}>
      <CraftAssetPicker
        actionLabel={actionLabel}
        criteria={criteria}
        limit={limit}
        multiSelect={multiSelect}
        value={value}
        onUpdate={updateValue}
      />
    </Control>
  );
};

export default AssetPicker;
