import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import * as ControlTypes from '@components/form-controls/control-types';
import type { ControlType } from '@components/form-controls/types';
import config, { Edition } from '@config/freeform/freeform.config';
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
  autoFocus?: boolean;
};

const types: {
  [key in PropertyType]?: ComponentType<ControlType<Property>>;
} = ControlTypes;

export const FormComponent: React.FC<Props> = ({
  value,
  updateValue,
  property,
  errors,
  context,
  autoFocus = false,
}) => {
  const { handle, type, visibilityFilters, flags } = property;
  const FormControl = types[type];

  const isVisible = useVisibility(
    visibilityFilters || [],
    context as GenericValue as GenericValue
  );

  if (FormControl === undefined) {
    return <div>{`[${handle}]: <${type}>`}</div>;
  }

  FormControl.displayName = `FormComponent: <${type}>`;

  if (!isVisible) {
    return null;
  }

  if (!config.editions.is(Edition.Pro) && flags?.includes(Edition.Pro)) {
    return null;
  }

  return (
    <ErrorBoundary message={`...${handle} <${type}>`}>
      <Suspense>
        <FormControl
          value={value as GenericValue}
          property={property}
          updateValue={updateValue}
          errors={errors}
          context={context}
          autoFocus={autoFocus}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
