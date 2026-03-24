import { LightSwitch } from "@components/elements/lightswitch/lightswitch";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import type { BooleanProperty } from "@ff-client/types/properties";
import type React from "react";

import { CheckboxItem, CheckboxWrapper } from "./bool.styles";

const Bool: React.FC<ControlType<BooleanProperty>> = ({
  value: enabled,
  property,
  errors,
  context,
  updateValue,
}) => {
  const isReadonly =
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");

  return (
    <Control
      property={property}
      errors={errors}
      context={context}
      preContent={
        <CheckboxWrapper>
          <CheckboxItem>
            <LightSwitch
              enabled={enabled}
              readOnly={isReadonly}
              onClick={(enabled) => updateValue(enabled)}
              errors={errors}
            />
          </CheckboxItem>
        </CheckboxWrapper>
      }
    ></Control>
  );
};

export default Bool;
