import { HexColorInput } from "@components/elements/hex-color-input/hex-color-input";
import type { ControlType } from "@components/form-controls/types";
import { Fields } from "@ff-client/types/field.classes";
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
  const isSolidSectionBackground =
    property.handle === "backgroundColor" &&
    typeof context === "object" &&
    context !== null &&
    "typeClass" in context &&
    context.typeClass === Fields.Layout &&
    "properties" in context &&
    typeof context.properties === "object" &&
    context.properties !== null &&
    "background" in context.properties &&
    context.properties.background === "color";

  return (
    <Control property={property} errors={errors} context={context}>
      <HexColorInput
        value={value ?? property.value ?? ""}
        onChange={updateValue}
        allowInherited={property.handle === "lineColor"}
        transparentLabel={
          ["cardBorderColor", "overlayColor"].includes(property.handle)
            ? "None"
            : undefined
        }
        allowTransparent={
          (property.handle === "backgroundColor" &&
            !isSolidSectionBackground) ||
          property.handle === "borderColor" ||
          property.handle === "overlayColor" ||
          property.handle === "cardBorderColor"
        }
      />
    </Control>
  );
};

export default ColorPicker;
