export function selectedNotificationEmails(form: HTMLFormElement): string[] {
  return Array.from(
    form.querySelectorAll<HTMLInputElement>(
      'input[name="selectedEmails[]"]:checked:not(:disabled)',
    ),
    (checkbox) => checkbox.value,
  );
}

export function notificationTemplateMode(form: HTMLFormElement): string {
  return (
    form.querySelector<HTMLInputElement>('input[name="templateMode"]:checked')
      ?.value ?? "custom"
  );
}

export function bindNotificationRecipients(
  form: HTMLFormElement,
  onLayoutChange?: () => void,
): void {
  const unavailableSelections = new WeakMap<HTMLInputElement, boolean>();
  let previousMode: boolean | undefined;
  let previousNeedsTemplate: boolean | undefined;
  const update = () => {
    const configured = notificationTemplateMode(form) === "configured";
    const enteringConfigured = configured && previousMode !== true;
    form
      .querySelectorAll<HTMLElement>("[data-custom-mode]")
      .forEach((element) => {
        element.hidden = configured;
      });
    form
      .querySelectorAll<HTMLElement>("[data-configured-mode]")
      .forEach((element) => {
        element.hidden = !configured;
      });
    form
      .querySelectorAll<HTMLElement>(".notification-mode-option")
      .forEach((option) => {
        option.classList.toggle(
          "is-selected",
          option.querySelector<HTMLInputElement>("input")?.checked ?? false,
        );
      });
    form
      .querySelectorAll<HTMLElement>(".recipient-option")
      .forEach((option) => {
        const checkbox = option.querySelector<HTMLInputElement>(
          'input[name="selectedEmails[]"]',
        );
        if (!checkbox) return;
        const unavailable =
          configured && Number(option.dataset.configuredCount) === 0;
        if (unavailable && !checkbox.disabled) {
          unavailableSelections.set(checkbox, checkbox.checked);
          checkbox.checked = false;
        } else if (!unavailable && checkbox.disabled) {
          checkbox.checked = unavailableSelections.get(checkbox) ?? false;
          unavailableSelections.delete(checkbox);
        }
        checkbox.disabled = unavailable;
        if (enteringConfigured && !unavailable) {
          checkbox.checked = true;
        }
        option.hidden = unavailable;
      });
    const hasRecipients = Boolean(
      form.querySelector(".recipient-option:not([hidden])"),
    );
    form
      .querySelectorAll<HTMLElement>("[data-recipient-controls]")
      .forEach((element) => {
        element.hidden = !hasRecipients;
      });
    const empty = form.querySelector<HTMLElement>("[data-recipient-empty]");
    if (empty) empty.hidden = hasRecipients;
    const templateField = form.querySelector<HTMLElement>(
      "[data-template-field]",
    );
    const needsTemplate =
      !configured ||
      Boolean(
        form
          .querySelector<HTMLTextAreaElement>('textarea[name="emails"]')
          ?.value.trim(),
      );
    if (templateField) {
      const anchor = form.querySelector(
        configured
          ? "[data-additional-template-anchor]"
          : "[data-custom-template-anchor]",
      );
      if (anchor && templateField.previousElementSibling !== anchor) {
        anchor.after(templateField);
      }
      templateField.hidden = !needsTemplate;
      const select = templateField.querySelector("select");
      if (select) {
        select.disabled = !needsTemplate;
        select.required = needsTemplate;
      }
      const label = templateField.querySelector<HTMLElement>(
        "[data-template-label]",
      );
      if (label)
        label.textContent =
          (configured
            ? label.dataset.configuredLabel
            : label.dataset.customLabel) ?? "";
    }
    const count = form.querySelector<HTMLElement>("[data-recipient-count]");
    const selectedCount = selectedNotificationEmails(form).length;
    if (count?.dataset.countLabel) {
      count.textContent = count.dataset.countLabel.replace(
        "{count}",
        String(selectedCount),
      );
    }
    form
      .querySelectorAll<HTMLButtonElement>("[data-select-recipients]")
      .forEach((button) => {
        button.dataset.selectRecipients = selectedCount ? "none" : "all";
        const label = selectedCount
          ? button.dataset.deselectLabel
          : button.dataset.selectLabel;
        if (label) button.textContent = label;
      });
    if (
      previousMode !== configured ||
      previousNeedsTemplate !== needsTemplate
    ) {
      previousMode = configured;
      previousNeedsTemplate = needsTemplate;
      onLayoutChange?.();
    }
  };
  form.addEventListener("change", update);
  form.addEventListener("input", update);
  update();
  form
    .querySelectorAll<HTMLButtonElement>("[data-select-recipients]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        form
          .querySelectorAll<HTMLInputElement>(
            'input[name="selectedEmails[]"]:not(:disabled)',
          )
          .forEach((checkbox) => {
            checkbox.checked = button.dataset.selectRecipients === "all";
          });
        update();
      });
    });
}
