import { ButtonGroup } from "@components/elements/button-group/button-group";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { Field } from "@editor/store/slices/layout/fields";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import type { ButtonGroupProperty } from "@ff-client/types/properties";

const DateOrderControl: React.FC<ControlType<ButtonGroupProperty, Field>> = ({
  value,
  property,
  errors,
  context,
  updateValue,
}) => {
  const { getTranslation } = useTranslations(context);
  const settings = context?.properties ?? {};
  const year =
    getTranslation<boolean>("date4DigitYear", settings.date4DigitYear) !== false
      ? "YYYY"
      : "YY";
  const padded =
    getTranslation<boolean>("dateLeadingZero", settings.dateLeadingZero) !==
    false;
  const raw = getTranslation("dateSeparator", settings.dateSeparator) ?? "-";
  const separator = raw === "space" ? " " : raw === "empty" ? "" : raw;
  const parts: Record<string, string> = {
    y: year,
    m: padded ? "MM" : "M",
    d: padded ? "DD" : "D",
  };
  const options = property.options.map((option) =>
    "value" in option && ["ymd", "mdy", "dmy"].includes(option.value)
      ? {
          ...option,
          label: option.value
            .split("")
            .map((token) => parts[token])
            .join(separator),
        }
      : option,
  );
  return (
    <Control property={property} errors={errors} context={context}>
      <ButtonGroup
        small
        label={property.label}
        value={value}
        options={options}
        onClick={updateValue}
      />
    </Control>
  );
};

export default DateOrderControl;
