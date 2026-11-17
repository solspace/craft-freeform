import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { Field } from "@editor/store/slices/layout/fields";
import type { SelectProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

export function RatingDefaultValue({
  property,
  value,
  context,
  updateValue,
  errors,
}: ControlType<SelectProperty, Field>) {
  const max = Math.max(
    1,
    Math.min(10, Number(context?.properties.maxValue) || 5),
  );
  const valid =
    !value ||
    (Number.isInteger(Number(value)) &&
      Number(value) >= 1 &&
      Number(value) <= max);
  return (
    <Control property={property} context={context} errors={errors}>
      <Dropdown
        ariaLabel={property.label ?? translate("Default value")}
        disabled={property.disabled}
        value={valid ? (value ?? "") : ""}
        emptyOption={translate("None")}
        options={Array.from({ length: max }, (_, index) => ({
          value: String(index + 1),
          label: String(index + 1),
        }))}
        onChange={updateValue}
      />
    </Control>
  );
}
