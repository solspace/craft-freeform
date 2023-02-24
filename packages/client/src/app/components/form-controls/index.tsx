import type { ComponentType } from 'react';
import React from 'react';
import { Suspense } from 'react';
import * as ControlTypes from '@components/form-controls/control-types';
import type { ControlType } from '@components/form-controls/types';
import type { Property, PropertyType } from '@ff-client/types/properties';

import { ErrorBoundary } from './boundaries/ErrorBoundary';

export type UpdateValue<T> = (value: T) => void;

type Props = {
  value: unknown;
  property: Property;
  updateValue: UpdateValue<unknown>;
  context?: unknown;
};

const types: {
  [key in PropertyType]?: ComponentType<ControlType<unknown>>;
} = ControlTypes;

export const FormComponent: React.FC<Props> = ({
  value,
  updateValue,
  property,
  context,
}) => {
  const FormControl = types[property.type];
  if (FormControl === undefined) {
    return <div>{`...${property.handle} <${property.type}>`}</div>;
  }

  FormControl.displayName = `FormComponent: <${property.type}>`;

  return (
    <ErrorBoundary message={`...${property.handle} <${property.type}>`}>
      <Suspense>
        <FormControl
          value={value}
          property={property}
          updateValue={updateValue}
          context={context}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
