import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import { ErrorBoundary } from '@components/form-controls/boundaries/ErrorBoundary';

import type { OptionsConfiguration } from '../options.types';
import { Source } from '../options.types';

import * as SourceComponents from './index';

type Props = {
  value: OptionsConfiguration;
  updateValue: (value: OptionsConfiguration) => void;
};

const components: {
  [key in Source]?: ComponentType<Props>;
} = SourceComponents;

export const SourceComponent: React.FC<Props> = ({ value, updateValue }) => {
  const { source = Source.Custom } = value;

  const SourceComponent = components[source];
  if (SourceComponent === undefined) {
    return <div>{source} not implemented...</div>;
  }

  SourceComponent.displayName = `Source <${source}>`;

  return (
    <ErrorBoundary message={`...${source} not implemented`}>
      <Suspense>
        <SourceComponent value={value} updateValue={updateValue} />
      </Suspense>
    </ErrorBoundary>
  );
};
