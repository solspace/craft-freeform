import React from 'react';
import type { ControlType } from '@components/form-controls/types';
import type { HiddenProperty } from '@ff-client/types/properties';

const Hidden: React.FC<ControlType<HiddenProperty>> = ({ value, property }) => {
  const { handle } = property;

  return (
    <input
      id={handle}
      type="hidden"
      value={value === undefined || value === null ? '' : value}
    />
  );
};

export default Hidden;
