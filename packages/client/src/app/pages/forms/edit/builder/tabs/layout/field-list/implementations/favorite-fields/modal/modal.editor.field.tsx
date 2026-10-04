import { FormComponent } from "@components/form-controls";
import { useValueUpdateGenerator } from "@editor/store/hooks/value-update-generator";
import type { PropertyValueCollection } from "@ff-client/types/fields";
import type { GenericValue, Property } from "@ff-client/types/properties";
import type React from "react";

type Props = {
  control?: React.ComponentProps<typeof FormComponent>["control"];
  property: Property;
  siblingProperties: Property[];
  state: PropertyValueCollection;
  errors?: string[];
  updateValueCallback: (key: string, value: GenericValue) => void;
};

export const FavoriteFieldComponent: React.FC<Props> = ({
  property,
  control,
  siblingProperties,
  state,
  errors,
  updateValueCallback,
}) => {
  const generateUpdateHandler = useValueUpdateGenerator(
    siblingProperties,
    state,
    updateValueCallback,
  );

  return (
    <FormComponent
      control={control}
      value={state?.[property.handle] || ""}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={errors}
      context={{ properties: state }}
    />
  );
};
