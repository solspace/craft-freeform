/** Give repeated cached form fragments independent generated ID namespaces. */
export function prepareFieldIds(form: HTMLFormElement): void {
  const prefix = form.getAttribute("data-freeform-id-prefix");
  if (!prefix) return;
  const placements = Array.from(
    document.querySelectorAll<HTMLFormElement>("form[data-freeform-id-prefix]"),
  ).filter(
    (candidate) => candidate.getAttribute("data-freeform-id-prefix") === prefix,
  );
  if (placements[0] === form || placements.length < 2) return;

  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  const next = prefix.replace(/[a-f0-9]{12}-$/, `${suffix}-`);
  const ids = new Map<string, string>();
  for (const element of form.querySelectorAll<HTMLElement>("[id]")) {
    if (element.id.startsWith(prefix))
      ids.set(element.id, next + element.id.slice(prefix.length));
  }
  const references = [
    "for",
    "aria-labelledby",
    "aria-describedby",
    "aria-controls",
    "aria-owns",
    "aria-activedescendant",
    "headers",
    "list",
    "data-field-error-id",
  ];
  for (const element of form.querySelectorAll<HTMLElement>("*")) {
    const id = ids.get(element.id);
    if (id) element.id = id;
    for (const attribute of references) {
      const value = element.getAttribute(attribute);
      if (value)
        element.setAttribute(
          attribute,
          value
            .split(/\s+/)
            .map((part) => ids.get(part) ?? part)
            .join(" "),
        );
    }
    const href = element.getAttribute("href");
    if (href?.startsWith("#") && ids.has(href.slice(1)))
      element.setAttribute("href", `#${ids.get(href.slice(1))}`);
  }
  form.setAttribute("data-freeform-id-prefix", next);
  const input = form.querySelector<HTMLInputElement>(
    'input[name="freeform-id-prefix"]',
  );
  if (input) input.value = next;
}
