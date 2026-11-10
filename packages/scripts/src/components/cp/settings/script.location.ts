export function initScriptInsertLocation(root: ParentNode = document): void {
  const field = root.querySelector("#script-insert-location-field");
  const warning = field?.querySelector<HTMLElement>(
    "[data-script-insert-warning]",
  );
  if (!field || !warning) return;

  const update = () => {
    const selected = field.querySelector<HTMLInputElement>(
      'input[name="settings[scriptInsertLocation]"]:checked',
    );
    warning.hidden = selected?.value !== "manual";
  };

  field.addEventListener("change", update);
  update();
}
