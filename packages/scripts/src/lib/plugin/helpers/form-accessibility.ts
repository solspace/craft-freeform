export function isVisible(
  element: HTMLElement,
  form: HTMLFormElement,
): boolean {
  if (
    (element instanceof HTMLInputElement && element.type === "hidden") ||
    element.matches(":disabled")
  )
    return false;
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    if (
      node.hasAttribute("hidden") ||
      node.hasAttribute("inert") ||
      node.getAttribute("aria-hidden") === "true"
    )
      return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (node === form) break;
  }
  return true;
}

export function fieldFocusTarget(
  container: HTMLElement,
  form: HTMLFormElement,
): HTMLElement | undefined {
  const fields = Array.from(
    container.querySelectorAll<HTMLElement>(
      "input, select, textarea, [data-freeform-file-upload]",
    ),
  );
  const invalid = fields.filter(
    (field) => field.getAttribute("aria-invalid") === "true",
  );
  for (const field of invalid.length ? invalid : fields) {
    const target = field.hasAttribute("data-freeform-file-upload")
      ? field.matches("button, [tabindex]")
        ? field
        : field.querySelector<HTMLElement>(
            "button, [tabindex], input:not([type=hidden])",
          )
      : field;
    if (target && isVisible(target, form)) return target;
  }
}

export function appendErrorSummary(
  form: HTMLFormElement,
  banner: HTMLElement,
): void {
  if (banner.querySelector("[data-freeform-error-summary]")) return;
  const list = document.createElement("ul");
  list.dataset.freeformErrorSummary = "";
  for (const container of form.querySelectorAll<HTMLElement>(
    "[data-field-container]",
  )) {
    const ownError = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[aria-invalid="true"], [data-field-errors]',
      ),
    ).some((node) => node.closest("[data-field-container]") === container);
    if (!ownError) continue;
    const target = fieldFocusTarget(container, form);
    if (!target) continue;
    if (!target.id) target.id = `freeform-error-${crypto.randomUUID()}`;
    const label =
      container
        .querySelector<HTMLElement>(
          ":scope > legend, :scope > label, label, legend",
        )
        ?.textContent?.trim() || container.dataset.fieldContainer;
    const errors = Array.from(
      container.querySelectorAll<HTMLElement>("[data-field-errors]"),
    )
      .filter((node) => node.closest("[data-field-container]") === container)
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    const link = document.createElement("a");
    link.href = `#${target.id}`;
    link.dataset.freeformErrorField = container.dataset.fieldContainer;
    link.textContent = errors ? `${label}: ${errors}` : (label ?? "");
    const item = document.createElement("li");
    item.append(link);
    list.append(item);
  }
  if (!list.children.length) return;
  const heading = document.createElement("p");
  heading.textContent =
    form.dataset.errorSummaryMessage || "Please correct the following fields:";
  banner.append(heading, list);
}

export function focusPage(form: HTMLFormElement): boolean {
  const heading = form.querySelector<HTMLElement>(
    "[data-freeform-page-heading], [aria-current=step]",
  );
  if (!heading || !isVisible(heading, form)) return false;
  heading.tabIndex = -1;
  heading.focus();
  return document.activeElement === heading;
}

export function processingStatus(form: HTMLFormElement): HTMLElement {
  let status = form.querySelector<HTMLElement>(
    "[data-freeform-processing-status]",
  );
  if (!status) {
    status = document.createElement("span");
    status.dataset.freeformProcessingStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    form.append(status);
  }
  return status;
}
