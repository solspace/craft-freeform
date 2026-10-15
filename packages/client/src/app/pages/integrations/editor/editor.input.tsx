import { FormComponent } from "@components/form-controls";
import { useValueUpdateGenerator } from "@editor/store/hooks/value-update-generator";
import type { ErrorCollection } from "@ff-client/types/api";
import { IntegrationType } from "@ff-client/types/integrations";
import type { GenericValue, Property } from "@ff-client/types/properties";
import type React from "react";

import type { Integration } from "../integration.types";
import { ModelInput } from "./editor.model-input";
import type { IntegrationState } from "./editor.types";

type Props = {
  property: Property;
  integration: Integration;
  autoFocus?: boolean;
  values?: IntegrationState;
  errors?: ErrorCollection;
  onUpdate?: (key: string, value: GenericValue) => void;
};

export const EditorInput: React.FC<Props> = ({
  property,
  integration,
  autoFocus,
  values,
  errors,
  onUpdate,
}) => {
  const generateUpdateHandler = useValueUpdateGenerator(
    integration.properties,
    {},
    (key, value) => {
      onUpdate?.(key, value);
    },
  );

  const handle = property.handle;
  const value = values.metadata[handle] ?? property.value;
  const updatedProperty: Property = {
    ...property,
    flags: (property.flags || [])?.filter(
      (flag) => flag !== "as-readonly-in-instance",
    ),
  };

  const context = {
    ...integration,
    values: {
      name: values.name,
      handle: values.handle,
      enabled: values.enabled,
      ...values.metadata,
    },
  };

  if (
    integration.type.type === IntegrationType.Ai &&
    handle === "model" &&
    ["OpenAI", "Gemini", "Anthropic", "xAI"].includes(integration.type.name)
  ) {
    return (
      <ModelInput
        integration={integration}
        property={updatedProperty}
        values={values}
        errors={errors}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <FormComponent
      autoFocus={autoFocus}
      value={value}
      property={updatedProperty}
      updateValue={generateUpdateHandler(updatedProperty)}
      errors={errors?.metadata?.[handle]}
      context={context}
    />
  );
};
