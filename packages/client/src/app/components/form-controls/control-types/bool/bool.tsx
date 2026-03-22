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
