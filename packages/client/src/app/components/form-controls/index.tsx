import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import * as ControlTypes from '@components/form-controls/control-types';
import type { ControlType } from '@components/form-controls/types';
import type { Property, PropertyType } from '@ff-client/types/properties';
import camelCase from 'lodash.camelcase';

import { ErrorBoundary } from './boundaries/ErrorBoundary';

export type UpdateValue<T> = (value: T) => void;

type Props = {
  value: unknown;
  property: Property;
  updateValue: UpdateValue<unknown>;
  errors?: string[];
  context?: unknown;
};

const types: {
  [key in PropertyType]?: ComponentType<ControlType<unknown>>;
} = ControlTypes;

export const FormComponent: React.FC<Props> = ({
  value,
  updateValue,
  property,
  errors,
  context,
}) => {
  const type = camelCase(property.type) as PropertyType;
  const FormControl = types[type];
  if (FormControl === undefined) {
    return <div>{`...${property.handle} <${type}>`}</div>;
  }

  FormControl.displayName = `FormComponent: <${type}>`;

  return (
    <ErrorBoundary message={`...${property.handle} <${property.type}>`}>
      <Suspense>
        <FormControl
          value={value}
          property={property}
          updateValue={updateValue}
          errors={errors}
          context={context}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
