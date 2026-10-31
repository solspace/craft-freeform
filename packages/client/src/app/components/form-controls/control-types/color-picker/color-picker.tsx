import { HexColorInput } from "@components/elements/hex-color-input/hex-color-input";
import type { ControlType } from "@components/form-controls/types";
import type { ColorProperty } from "@ff-client/types/properties";
import type React from "react";

import { Control } from "../../control";

const ColorPicker: React.FC<ControlType<ColorProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  return (
    <Control property={property} errors={errors} context={context}>
      <HexColorInput
        value={value}
        onChange={updateValue}
        allowTransparent={
          property.handle === "backgroundColor" ||
          property.handle === "borderColor"
        }
      />
    </Control>
  );
};

export default ColorPicker;
