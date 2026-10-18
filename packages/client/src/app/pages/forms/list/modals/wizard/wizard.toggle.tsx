import {
  LightSwitchHandle,
  LightSwitchWrapper,
} from "@components/elements/lightswitch/lightswitch.styles";
import config from "@config/freeform/freeform.config";
import { useId } from "react";

export function WizardToggle({
  label,
  checked,
  disabled = false,
  instructions,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  instructions?: string;
  onChange: (checked: boolean) => void;
}) {
  const instructionsId = useId();
  return (
    <div className="wizard-check wizard-toggle">
      <LightSwitchWrapper
        as="button"
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        aria-describedby={instructions ? instructionsId : undefined}
        disabled={disabled}
        className={[
          checked && "on",
          disabled && "readonly",
          config.metadata.craft.is.atLeast("5.8.0") && "craft-5_8",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onChange(!checked)}
      >
        <LightSwitchHandle />
      </LightSwitchWrapper>
      <div className="wizard-toggle-text">
        <span>{label}</span>
        {instructions && (
          <p className="wizard-toggle-instructions" id={instructionsId}>
            {instructions}
          </p>
        )}
      </div>
    </div>
  );
}
