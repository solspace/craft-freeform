import { ButtonGroup } from "@components/elements/button-group/button-group";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { BooleanProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";

const ClockFormatControl: React.FC<ControlType<BooleanProperty>> = ({
  value,
  property,
  errors,
  context,
  updateValue,
}) => (
  <Control property={property} errors={errors} context={context}>
    <ButtonGroup
      label={property.label}
      value={value ? "24" : "12"}
      options={[
        { value: "12", label: translate("12-hour") },
        { value: "24", label: translate("24-hour") },
      ]}
      onClick={(choice) => updateValue(choice === "24")}
    />
  </Control>
);

export default ClockFormatControl;
