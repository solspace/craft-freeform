import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { SelectProperty } from "@ff-client/types/properties";
import type React from "react";
import { useMemo } from "react";

import { addSelectOptionIcons } from "./select-option-icons";

const Select: React.FC<ControlType<SelectProperty>> = ({
  value,
  property,
  context,
  errors,
  updateValue,
}) => {
  const { options, emptyOption } = property;
  const iconOptions = useMemo(
    () => addSelectOptionIcons(property.handle, options),
    [property.handle, options],
  );

  return (
    <Control property={property} errors={errors} context={context}>
      <Dropdown
        value={value ?? ""}
        emptyOption={emptyOption}
        options={iconOptions}
        showSelectedIcon={
          property.handle === "formattingTemplate" ||
          property.handle === "defaultStatus"
        }
        onChange={updateValue}
      />
    </Control>
  );
};

export default Select;
