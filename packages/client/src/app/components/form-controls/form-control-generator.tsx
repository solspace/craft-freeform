import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import { useAppDispatch } from '@editor/store';
import type { Property, PropertyType } from '@ff-client/types/properties';
import camelCase from 'lodash.camelcase';

import { ErrorBoundary } from './boundaries/ErrorBoundary';
import * as FormControlTypes from './controls';
import type { FormControlType } from './types';

type Props = {
  namespace: string;
  value: unknown;
  property: Property;
};

const types: {
  [key in PropertyType]?: ComponentType<FormControlType<unknown>>;
} = FormControlTypes;

export const FormControlGenerator: React.FC<Props> = ({
  namespace,
  value,
  property,
}) => {
  const dispatch = useAppDispatch();

  const typeName = camelCase(property.type) as PropertyType;
  const FormControl = types[typeName];
  if (FormControl === undefined) {
    return (
      <div>{`...${property.handle} <${property.type} [${typeName}]>`}</div>
    );
  }

  FormControl.displayName = `Setting <${property.type}>`;

  return (
    <ErrorBoundary message={`...${property.handle} <${property.type}>`}>
      <Suspense>
        <FormControl
          namespace={namespace}
          value={value}
          property={property}
          dispatch={dispatch}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
