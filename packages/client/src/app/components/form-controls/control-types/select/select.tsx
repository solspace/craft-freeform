import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { SelectProperty } from "@ff-client/types/properties";
import type React from "react";
import { useMemo } from "react";
import { ChoiceButtons, choiceButtonKind } from "./choice-buttons";
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
  const choices =
    options?.flatMap((option) =>
      "value" in option
        ? [{ value: String(option.value), label: option.label }]
        : [],
    ) ?? [];
  const kind = choiceButtonKind(property.handle, choices);

  return (
    <Control property={property} errors={errors} context={context}>
      {kind ? (
        <ChoiceButtons
          label={property.label ?? ""}
          value={value}
          options={choices}
          kind={kind}
          disabled={property.disabled}
          onChange={updateValue}
        />
      ) : (
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
      )}
    </Control>
  );
};

export default Select;
