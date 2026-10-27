import { ButtonGroup } from "@components/elements/button-group/button-group";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { ButtonGroupProperty } from "@ff-client/types/properties";
import type React from "react";

const ButtonGroupField: React.FC<ControlType<ButtonGroupProperty>> = ({
  value,
  property,
  errors,
  context,
  updateValue,
}) => {
  const { options } = property;

  return (
    <Control property={property} errors={errors} context={context}>
      <ButtonGroup
        label={property.label}
        value={value}
        options={options}
        onClick={(value) => updateValue(value)}
      />
    </Control>
  );
};

export default ButtonGroupField;
