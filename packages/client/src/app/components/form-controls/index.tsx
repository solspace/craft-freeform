import type { ComponentType } from 'react';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import * as ControlTypes from '@components/form-controls/control-types';
import type { ControlType } from '@components/form-controls/types';
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
}) => {
  const type = property.type;
  const FormControl = types[type];

  const isVisible = useVisibility(
    property.visibilityFilters || [],
    context as GenericValue as GenericValue
  );

  const ref = useRef<HTMLDivElement>();

  const [height, setHeight] = useState<number>(0);
  const [resizeObserver] = useState(
    () => new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
  );

  useEffect(() => {
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, [resizeObserver]);

  const animation = useSpring({
    opacity: isVisible ? 1 : 0,
    scaleY: isVisible ? 1 : 0,
    height: isVisible ? height + 14 : 0,
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
};
