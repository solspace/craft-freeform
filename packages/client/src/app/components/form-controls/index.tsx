import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import * as ControlTypes from '@components/form-controls/control-types';
import type { ControlType } from '@components/form-controls/types';
import type {
  GenericValue,
  Property,
  PropertyType,
} from '@ff-client/types/properties';

import { ErrorBoundary } from './boundaries/ErrorBoundary';
import { useVisibility } from './hooks/use-visibility';

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
  const type = property.type;
  const FormControl = types[type];

  const isVisible = useVisibility(
    property.visibilityFilters,
    context as GenericValue as GenericValue
  );

  if (FormControl === undefined) {
    return <div>{`[${property.handle}]: <${type}>`}</div>;
  }

  if (!isVisible) {
    return null;
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
