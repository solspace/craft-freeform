import type { ComponentType } from 'react';
import React, { Suspense } from 'react';
import { animated, useSpring } from 'react-spring';
import * as ControlTypes from '@components/form-controls/control-types';
import type { ControlType } from '@components/form-controls/types';
import { useDimensionsObserver } from '@ff-client/hooks/use-height-animation';
import type {
  GenericValue,
  Property,
  PropertyType,
} from '@ff-client/types/properties';
import styled from 'styled-components';

import { ErrorBoundary } from './boundaries/ErrorBoundary';
import { useVisibility } from './hooks/use-visibility';

export type UpdateValue<T> = (value: T) => void;

type Props = {
  value: unknown;
  property: Property;
  updateValue: UpdateValue<unknown>;
  errors?: string[];
  context?: unknown;
  animateVisibility?: boolean;
};

const types: {
  [key in PropertyType]?: ComponentType<ControlType<Property>>;
} = ControlTypes;

const AnimatedWrapper = styled(animated.div)`
  transform-origin: top;

  > div {
    padding-bottom: 10px;
  }
`;

export const FormComponent: React.FC<Props> = ({
  value,
  updateValue,
  property,
  errors,
  context,
  animateVisibility = false,
}) => {
  const type = property.type;
  const FormControl = types[type];

  const isVisible = useVisibility(
    property.visibilityFilters || [],
    context as GenericValue as GenericValue
  );

  const {
    ref,
    dimensions: { height },
  } = useDimensionsObserver<HTMLDivElement>();

  const animation = useSpring({
    opacity: isVisible ? 1 : 0,
    scaleY: isVisible ? 1 : 0,
    height: isVisible ? height + 12 : 0,
    config: {
      tension: 500,
      friction: 40,
      bounce: 0,
    },
  });

  if (FormControl === undefined) {
    return <div>{`[${property.handle}]: <${type}>`}</div>;
  }

  FormControl.displayName = `FormComponent: <${type}>`;

  if (animateVisibility) {
    return (
      <AnimatedWrapper style={animation}>
        <ErrorBoundary message={`...${property.handle} <${property.type}>`}>
          <Suspense>
            <div ref={ref}>
              <FormControl
                value={value as GenericValue}
                property={property}
                updateValue={updateValue}
                errors={errors}
                context={context}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      </AnimatedWrapper>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <ErrorBoundary message={`...${property.handle} <${property.type}>`}>
      <Suspense>
        <FormControl
          value={value as GenericValue}
          property={property}
          updateValue={updateValue}
          errors={errors}
          context={context}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
