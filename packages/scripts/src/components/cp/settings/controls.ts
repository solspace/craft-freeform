type SwitchButton = HTMLElement & {
  checked?: boolean;
  indeterminate?: boolean;
};

// Craft 6 emits change from the light-DOM switch button. Its hidden input is
// updated later in the component's render cycle, so read the button's state.
function switchIsOn(control: HTMLElement): boolean {
  const button = control.matches("craft-switch-button")
    ? control
    : control.querySelector<SwitchButton>("craft-switch-button");
  return !!(
    button &&
    ((button as SwitchButton).checked ?? button.hasAttribute("checked"))
  );
}

export function initializeSettingsControls(root: ParentNode = document): void {
  for (const button of root.querySelectorAll<SwitchButton>(
    "craft-switch-button.fieldtoggle",
  )) {
    // Craft.FieldToggle reads aria-checked during change, before the native
    // switch's render updates it. Capture runs before that handler even when
    // Craft initialized its listeners first.
    button.addEventListener(
      "change",
      () => {
        button.setAttribute(
          "aria-checked",
          switchIsOn(button)
            ? "true"
            : button.indeterminate
              ? "mixed"
              : "false",
        );
      },
      { capture: true },
    );
  }

  for (const input of root.querySelectorAll<HTMLInputElement>(
    'input[name="purge-toggle"]',
  )) {
    const control = input.closest<HTMLElement>("craft-switch");
    control?.addEventListener("change", () => {
      if (!switchIsOn(control)) {
        const range =
          root.querySelector<HTMLSelectElement>("select#purge-value");
        if (range) range.value = "0";
      }
    });
  }

  const builder = root.querySelector<HTMLElement>("#allow-builder-templates");
  builder?.addEventListener("change", () => {
    const defaults = root.querySelector<HTMLElement>("#template-default");
    if (!defaults) return;
    const enabled = switchIsOn(builder);
    defaults.classList.toggle("builder-templates", enabled);
    defaults.classList.toggle(
      "hidden",
      !enabled || !defaults.classList.contains("combined"),
    );
  });

  for (const [name, messageId, values] of [
    ["scriptInsertLocation", "script-insert-warning", ["manual"]],
    ["loggingLevel", "logging-level-warning", ["info", "debug"]],
  ] as const) {
    const select = root.querySelector<HTMLSelectElement>(
      `select[name="settings[${name}]"]`,
    );
    const field = select?.closest<HTMLElement>("craft-field, .field");
    if (!select || !field) continue;
    const message = root.querySelector(`#${messageId}`)?.textContent?.trim();
    const update = (): void => {
      field.querySelector("[data-freeform-setting-warning]")?.remove();
      if (!message || !(values as readonly string[]).includes(select.value))
        return;
      const warning = document.createElement("span");
      warning.setAttribute("data-freeform-setting-warning", "");
      warning.setAttribute("slot", "warning");
      warning.className = "warning with-icon";
      warning.textContent = message;
      field.append(warning);
    };
    select.addEventListener("change", update);
    update();
  }
}
