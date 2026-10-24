import { NumberInput } from "@components/elements/number-input/number-input";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { IntegerProperty } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import { parseNumericValue } from "@ff-client/utils/numbers";
import type React from "react";

const Int: React.FC<ControlType<IntegerProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  autoFocus,
  context,
}) => {
  const { handle, min, max, unsigned, step = 1 } = property;
  const properties =
    context &&
    typeof context === "object" &&
    "properties" in context &&
    context.properties &&
    typeof context.properties === "object"
      ? (context.properties as Record<string, unknown>)
      : undefined;
  const selectedUnit = property.unitProperty
    ? properties?.[property.unitProperty]
    : undefined;
  const unit = typeof selectedUnit === "string" ? selectedUnit : property.unit;
  const isReadOnly =
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");

  const onBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    updateValue(parseNumericValue(event.target.value, { min, max, unsigned }));
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateValue(parseNumericValue(event.target.value));
  };

  return (
    <Control property={property} errors={errors} context={context}>
      <NumberInput
        id={handle}
        unit={unit}
        className={classes(
          "text",
          "fullwidth",
          isReadOnly && ["readonly", "disabled"],
        )}
        value={value === undefined || value === null ? "" : value}
        autoFocus={autoFocus}
        step={step}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={isReadOnly}
      />
    </Control>
  );
};

export default Int;
