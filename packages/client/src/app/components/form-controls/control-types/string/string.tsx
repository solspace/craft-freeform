import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { StringProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

const String: React.FC<ControlType<StringProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { handle } = property;

  return (
    <Control property={property} errors={errors}>
      <input
        id={handle}
        type="text"
        autoComplete="off"
        className={classes(
          'text',
          'fullwidth',
          property?.flags?.includes('code') && 'code'
        )}
        value={value ?? ''}
        placeholder={property.placeholder}
        onChange={(event) => updateValue(event.target.value)}
      />
    </Control>
  );
};

export default String;
