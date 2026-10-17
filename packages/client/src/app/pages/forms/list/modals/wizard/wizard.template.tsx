import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { addSelectOptionIcons } from "@components/form-controls/control-types/select/select-option-icons";
import type { OptionCollection } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { useRef } from "react";

export function WizardTemplatePicker({
  value,
  groups,
  disabled,
  onChange,
}: {
  value: string;
  groups: OptionCollection;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <WizardSelectPicker
      label={translate("Formatting Template")}
      className="wizard-template-picker"
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={addSelectOptionIcons("formattingTemplate", [
        {
          value: "",
          label: translate("No Formatting Template (not recommended)"),
        },
        ...groups,
      ])}
    />
  );
}

export function WizardSelectPicker({
  value,
  options,
  label,
  className,
  disabled,
  onChange,
  ...errorProps
}: {
  value: string;
  options: OptionCollection;
  label: string;
  className?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
  "aria-errormessage"?: string;
}) {
  const trigger = useRef<HTMLDivElement>(null);
  return (
    // biome-ignore lint/a11y/useSemanticElements: The shared dropdown contains its own popup buttons; add keyboard support without nesting buttons.
    <div
      ref={trigger}
      role="button"
      aria-label={label}
      className={className}
      {...errorProps}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      style={{
        pointerEvents: disabled ? "none" : undefined,
        opacity: disabled ? 0.6 : 1,
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && trigger.current?.querySelector(".open"))
          requestAnimationFrame(() => trigger.current?.focus());
        if (
          event.target === event.currentTarget &&
          ["Enter", " "].includes(event.key)
        )
          event.preventDefault();
      }}
      onKeyUp={(event) => {
        if (
          event.target === event.currentTarget &&
          ["Enter", " "].includes(event.key)
        ) {
          event.stopPropagation();
          if (!disabled)
            (event.currentTarget.firstElementChild as HTMLElement)?.click();
        }
      }}
    >
      <Dropdown
        value={value}
        emptyOption={label}
        showSelectedIcon
        options={options}
        onChange={(next) => {
          if (!disabled) onChange(next);
        }}
      />
    </div>
  );
}
