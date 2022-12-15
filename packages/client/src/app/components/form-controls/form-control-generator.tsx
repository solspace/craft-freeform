import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import type { ValueUpdateHandler } from '@editor/builder/tabs/form-settings/form-settings';
import { selectFormSetting } from '@editor/store/slices/form';
import type { Property, PropertyType } from '@ff-client/types/properties';
import camelCase from 'lodash.camelcase';

import { ErrorBoundary } from './boundaries/ErrorBoundary';
import * as FormControlTypes from './controls';
import type { FormControlType } from './types';

type Props = {
  onValueUpdate: ValueUpdateHandler;
  namespace: string;
  property: Property;
};

const types: {
  [key in PropertyType]?: ComponentType<FormControlType<unknown>>;
} = FormControlTypes;

export const FormControlGenerator: React.FC<Props> = ({
  onValueUpdate,
  namespace,
  property,
}) => {
  const value = useSelector(selectFormSetting(namespace, property.handle));

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
          value={value}
          property={property}
          onUpdateValue={onValueUpdate}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
