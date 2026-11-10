import AppStateSelect from "@components/form-controls/control-types/app-state-select/app-state-select";
import Checkboxes from "@components/form-controls/control-types/checkboxes/checkboxes";
import type { ControlType } from "@components/form-controls/types";
import type { RootState } from "@editor/store";
import type { Field } from "@editor/store/slices/layout/fields";
import type { Property } from "@ff-client/types/properties";
import { PropertyType } from "@ff-client/types/properties";
import type React from "react";
import { useSelector } from "react-redux";

export const LocationIntegration: React.FC<ControlType<Property>> = (props) => {
  const needsEnabling = useSelector((state: RootState) => {
    const integrations = state.integrations.filter(
      (integration) => integration.shortName === "GooglePlaces",
    );
    return (
      integrations.length > 0 && !integrations.some((item) => item.enabled)
    );
  });

  if (props.property.type !== PropertyType.AppStateSelect) return null;

  return (
    <AppStateSelect
      {...props}
      property={{
        ...props.property,
        instructions: needsEnabling
          ? "Google Places is configured but not enabled for this form. Enable it in the Integrations tab, then select it here to use address autocomplete."
          : props.property.instructions,
      }}
    />
  );
};

export const LocationRequiredComponents: React.FC<ControlType<Property>> = (
  props,
) => {
  if (props.property.type !== PropertyType.Checkboxes) return null;
  const included =
    ((props.context as Field)?.properties?.includedComponents as string[]) ??
    [];
  return (
    <Checkboxes
      {...props}
      property={{
        ...props.property,
        options: props.property.options.filter(
          (option) => "value" in option && included.includes(option.value),
        ),
      }}
    />
  );
};
