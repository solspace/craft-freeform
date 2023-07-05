import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { FieldMappingProperty } from '@ff-client/types/properties';

const FieldMapping: React.FC<ControlType<FieldMappingProperty>> = ({
  value = [],
  property,
  errors,
  updateValue,
}) => {
  return (
    <Control property={property} errors={errors}>
      Field mapping lmao {JSON.stringify(value)}
    </Control>
  );
};

export default FieldMapping;
