import { ErrorBoundary } from "@components/form-controls/boundaries/ErrorBoundary";
import type React from "react";
import type { ComponentType } from "react";
import { Suspense } from "react";

import type { ConfigurationProps } from "../options.types";
import { Source } from "../options.types";

import * as SourceComponents from "./index";

const components: {
  [key in Source]?: ComponentType<ConfigurationProps>;
} = SourceComponents;

export const SourceComponent: React.FC<ConfigurationProps> = ({
  value,
  updateValue,
  property,
  defaultValue,
  updateDefaultValue,
  convertToCustomValues,
  isMultiple,
  autoUpdateHandle,
}) => {
  const { source = Source.Custom } = value;

  const Component = components[source];
  if (Component === undefined) {
    return <div>{source} not implemented...</div>;
  }

  Component.displayName = `Source <${source}>`;

  return (
    <ErrorBoundary message={`...${source} not implemented`}>
      <Suspense>
        <Component
          value={value}
          updateValue={updateValue}
          property={property}
          defaultValue={defaultValue}
          updateDefaultValue={updateDefaultValue}
          convertToCustomValues={convertToCustomValues}
          isMultiple={isMultiple}
          autoUpdateHandle={autoUpdateHandle}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
