import translate from "@ff-client/utils/translations";
import type { WizardDraft, WizardOptions } from "./wizard.types";

export function wizardValidation(
  draft: WizardDraft,
  step: number,
  options: WizardOptions,
  sites: { id: number }[],
): { message: string; fields: Set<string> } {
  const fields = new Set<string>();
  let message = "";
  const issue = (key: string, text: string) => {
    fields.add(key);
    if (!message) message = text;
  };
  if (
    step === 0 &&
    !options.presets.some((preset) => preset.id === draft.purpose)
  )
    issue("purpose", translate("Choose a purpose for your form."));
  if (step === 1) {
    if (!draft.name.trim())
      issue("name", translate("Enter a name for your form."));
    if (
      options.editableSettings.includes("handle") &&
      draft.handle &&
      !(
        options.allowDashesInHandles ? /^[a-zA-Z0-9_-]+$/ : /^[a-zA-Z0-9_]+$/
      ).test(draft.handle)
    )
      issue(
        "handle",
        translate(
          "Enter a valid form handle using letters, numbers, and underscores.",
        ),
      );
    if (
      options.editableSettings.includes("color") &&
      draft.color !== undefined &&
      !/^#[a-f\d]{6}$/i.test(draft.color)
    )
      issue("color", translate("Enter a form color in #RRGGBB format."));
    if (
      options.editableSettings.includes("defaultStatus") &&
      !options.statuses?.some((status) => status.value === draft.defaultStatus)
    )
      issue("defaultStatus", translate("Choose an available default status."));
    if (
      !draft.siteIds.length ||
      draft.siteIds.some((id) => !sites.some((site) => site.id === id))
    )
      issue("siteIds", translate("Select at least one site you can edit."));
  }
  if (step === 2) {
    if (!draft.fields.length || draft.fields.length > options.fieldLimit)
      issue(
        "fields",
        translate("Choose between 1 and {count} fields.", {
          count: options.fieldLimit,
        }),
      );
    for (const field of draft.fields) {
      if (!field.label.trim())
        issue(`label:${field.key}`, translate("Give every field a label."));
      if (
        ["dropdown", "radios", "checkboxes"].includes(field.type) &&
        (!field.options.length ||
          field.options.length > 50 ||
          field.options.some((option) => !option.trim()) ||
          new Set(field.options.map((option) => option.trim())).size !==
            field.options.length)
      )
        issue(
          `options:${field.key}`,
          translate("Give each choice a unique, nonempty label."),
        );
    }
  }
  if (
    step === 4 &&
    draft.successBehavior === "redirect-return-url" &&
    !/^(\/(?!\/)|https?:\/\/)/i.test(draft.returnUrl)
  )
    issue(
      "returnUrl",
      translate("Enter a redirect URL beginning with /, https://, or http://."),
    );
  if (step === 5) {
    const templateExists = (value: string) =>
      options.notificationTemplates.some(
        (template) => template.value === value,
      );
    if (draft.adminEnabled) {
      const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.adminEmail);
      const templateInvalid =
        !draft.adminNewTemplate && !templateExists(draft.adminTemplate);
      if (emailInvalid) fields.add("adminEmail");
      if (templateInvalid) fields.add("adminTemplate");
      if (emailInvalid && templateInvalid)
        message = translate(
          "Choose a template and enter a valid team email address.",
        );
      else if (emailInvalid)
        message = translate("Enter a valid team email address.");
      else if (templateInvalid)
        message = translate("Choose a template for the team notification.");
    }
    if (draft.confirmationEnabled) {
      const fieldInvalid = !draft.fields.some(
        (field, index) =>
          field.type === "email" &&
          (field.key.startsWith("extra")
            ? `customField${index}`
            : field.key) === draft.confirmationField,
      );
      const templateInvalid =
        !draft.confirmationNewTemplate &&
        !templateExists(draft.confirmationTemplate);
      if (fieldInvalid) fields.add("confirmationField");
      if (templateInvalid) fields.add("confirmationTemplate");
      if (!message) {
        if (fieldInvalid && templateInvalid)
          message = translate(
            "Choose an Email field and template for the visitor confirmation.",
          );
        else if (fieldInvalid)
          message = translate(
            "Choose an Email field for the visitor confirmation.",
          );
        else if (templateInvalid)
          message = translate(
            "Choose a template for the visitor confirmation.",
          );
      }
    }
  }
  return { message, fields };
}
