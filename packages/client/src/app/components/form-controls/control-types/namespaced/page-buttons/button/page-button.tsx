import { LightSwitch } from "@components/elements/lightswitch/lightswitch";
import {
  ControlWrapper,
  FormField,
} from "@components/form-controls/control.styles";
import { CheckboxWrapper } from "@components/form-controls/control-types/bool/bool.styles";
import { Label } from "@components/form-controls/label.styles";
import type { ControlType } from "@components/form-controls/types";
import type { PageButtonProperty } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { PageButtonWrapper } from "./page-button.styles";

const PageButton: React.FC<ControlType<PageButtonProperty>> = ({
  value,
  property,
  updateValue,
}) => {
  return (
    <ControlWrapper $width={property.width}>
      <PageButtonWrapper>
        <CheckboxWrapper>
          {property.togglable && (
            <LightSwitch
              enabled={value.enabled}
              onClick={(enabled) => updateValue({ ...value, enabled })}
            />
          )}

          <Label>{translate(property.label)}</Label>
        </CheckboxWrapper>
      </PageButtonWrapper>

      {(!property.togglable || value.enabled) && (
        <FormField>
          <input
            type="text"
            className={classes("text", "fullwidth")}
            placeholder={translate("Label")}
            value={value.label ?? ""}
            onChange={(event) =>
              updateValue({ ...value, label: event.target.value })
            }
          />
        </FormField>
      )}
    </ControlWrapper>
  );
};

export default PageButton;
