import translate from "@ff-client/utils/translations";
import { WizardToggle } from "./wizard.toggle";
import type { WizardOptions } from "./wizard.types";

export function WizardNotificationTemplate({
  options,
  create,
  value,
  label,
  onCreateChange,
  onValueChange,
  invalid = false,
  errorId,
}: {
  options: WizardOptions;
  create: boolean;
  value: string;
  label: string;
  onCreateChange: (create: boolean) => void;
  onValueChange: (value: string) => void;
  invalid?: boolean;
  errorId?: string;
}) {
  return (
    <fieldset className="wizard-email-template" aria-label={label}>
      {options.canCreateNotificationTemplates && (
        <WizardToggle
          label={translate("Create a new template")}
          checked={create}
          disabled={!options.notificationTemplates.length}
          onChange={onCreateChange}
          instructions={
            create
              ? translate(
                  options.notificationTemplateScope === "form"
                    ? "A new form-specific template will be created with this form."
                    : "A new global template will be created with this form.",
                )
              : undefined
          }
        />
      )}
      {create && !options.canCreateNotificationTemplates && (
        <p className="wizard-hint">
          {translate(
            options.notificationTemplateScope === "form"
              ? "A new form-specific template will be created with this form."
              : "A new global template will be created with this form.",
          )}
        </p>
      )}
      {!create && (
        <label className="wizard-field">
          <span>{translate("Email template")}</span>
          <div className="select fullwidth wizard-select">
            <select
              aria-invalid={invalid || undefined}
              aria-errormessage={invalid ? errorId : undefined}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
            >
              <option value="">{translate("Choose a template")}</option>
              {options.notificationTemplates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      )}
    </fieldset>
  );
}
