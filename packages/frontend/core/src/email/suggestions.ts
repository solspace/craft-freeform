// Intentionally curated: do not fuzzy-match arbitrary company or regional domains.
const corrections = new Map<string, string>([
  ["gmial.com", "gmail.com"],
  ["gamil.com", "gmail.com"],
  ["gmali.com", "gmail.com"],
  ["gmai.com", "gmail.com"],
  ["gmal.com", "gmail.com"],
  ["gnail.com", "gmail.com"],
  ["gmaill.com", "gmail.com"],
  ["hotmial.com", "hotmail.com"],
  ["hotamil.com", "hotmail.com"],
  ["hotmal.com", "hotmail.com"],
  ["hotmai.com", "hotmail.com"],
  ["outlok.com", "outlook.com"],
  ["outllook.com", "outlook.com"],
  ["otulook.com", "outlook.com"],
  ["outloook.com", "outlook.com"],
  ["yaho.com", "yahoo.com"],
  ["yhaoo.com", "yahoo.com"],
  ["yahooo.com", "yahoo.com"],
  ["iclod.com", "icloud.com"],
  ["iclould.com", "icloud.com"],
]);
for (const provider of [
  "gmail",
  "hotmail",
  "outlook",
  "yahoo",
  "icloud",
  "aol",
  "protonmail",
  "proton",
]) {
  for (const ending of ["con", "cmo", "comm", "ocm"]) {
    corrections.set(`${provider}.${ending}`, `${provider}.com`);
  }
}

/** A suggestion only; never use this to validate or automatically rewrite an address. */
export function getEmailSuggestion(value: string): string | undefined {
  if (value.length > 254) return undefined;
  const parts = value.trim().split("@");
  if (parts.length !== 2) return undefined;
  const [local, domain] = parts;
  if (
    !local ||
    local.length > 64 ||
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  )
    return undefined;
  const replacement = corrections.get(domain.toLowerCase());
  return replacement ? `${local}@${replacement}` : undefined;
}

export type EmailSuggestionLabels = { message?: string; action?: string };
let nextId = 0;

/** Shared DOM behavior for classic forms and the React/Vue built-in renderers. */
export function mountEmailSuggestions(
  input: HTMLInputElement,
  labels: EmailSuggestionLabels = {},
  onAccept?: (value: string) => void,
) {
  const doc = input.ownerDocument;
  const root = doc.createElement("div");
  root.className = "freeform-email-suggestion";
  root.hidden = true;
  const message = doc.createElement("span");
  do {
    message.id = `freeform-email-suggestion-${++nextId}`;
  } while (doc.getElementById(message.id));
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");
  const button = doc.createElement("button");
  button.type = "button";
  button.textContent = labels.action ?? "Use suggestion";
  button.className = "freeform-email-suggestion-action";
  button.setAttribute("aria-describedby", message.id);
  root.append(message, button);
  const next = input.nextElementSibling;
  (next instanceof HTMLLabelElement && next.htmlFor === input.id
    ? next
    : input
  ).after(root);

  const style = (element: HTMLElement, values: Record<string, string>) => {
    for (const [key, value] of Object.entries(values))
      element.style.setProperty(key, value, "important");
  };
  // Inline layout keeps headless renderers usable with any theme and requires no extra CSS import.
  style(root, {
    display: "none",
    "flex-wrap": "wrap",
    "align-items": "baseline",
    gap: ".25rem .5rem",
    "margin-top": ".25rem",
    "font-size": ".8125rem",
    "line-height": "1.5",
    "overflow-wrap": "anywhere",
    color: "var(--ff-email-suggestion-color, inherit)",
  });
  style(button, {
    display: "inline-block",
    width: "auto",
    "min-height": "24px",
    margin: "0",
    padding: "0 .125rem",
    border: "0",
    "border-radius": ".125rem",
    background: "transparent",
    "box-shadow": "none",
    color: "var(--ff-email-suggestion-action, inherit)",
    font: "inherit",
    "text-decoration": "underline",
    "text-underline-offset": ".15em",
    cursor: "pointer",
  });
  let source: string | undefined;
  let suggestion: string | undefined;
  const describe = (visible: boolean) => {
    const ids = new Set(
      (input.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean),
    );
    if (visible) ids.add(message.id);
    else ids.delete(message.id);
    if (ids.size) input.setAttribute("aria-describedby", [...ids].join(" "));
    else input.removeAttribute("aria-describedby");
  };
  const hide = () => {
    root.hidden = true;
    style(root, { display: "none" });
    message.textContent = "";
    describe(false);
    suggestion = undefined;
    source = undefined;
  };
  const check = () => {
    hide();
    if (input.matches(":disabled") || input.readOnly || input.multiple) return;
    const candidate = getEmailSuggestion(input.value);
    if (
      !candidate ||
      (input.maxLength >= 0 && candidate.length > input.maxLength)
    )
      return;
    source = input.value;
    suggestion = candidate;
    root.hidden = false;
    style(root, { display: "flex" });
    message.textContent = (
      labels.message ?? "Did you mean {suggestion}?"
    ).replace(/\{suggestion\}/g, () => candidate);
    describe(true);
  };
  const accept = () => {
    if (
      !suggestion ||
      input.value !== source ||
      input.matches(":disabled") ||
      input.readOnly ||
      input.multiple ||
      (input.maxLength >= 0 && suggestion.length > input.maxLength)
    ) {
      hide();
      return;
    }
    const value = suggestion;
    input.value = value;
    hide();
    onAccept?.(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
  };
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (!event.defaultPrevented) hide();
    });
  const form = input.form;
  input.addEventListener("blur", check);
  input.addEventListener("input", hide);
  input.addEventListener("change", hide);
  button.addEventListener("click", accept);
  form?.addEventListener("reset", reset);
  const observer = new MutationObserver(() => {
    if (input.matches(":disabled") || input.readOnly || input.multiple) hide();
  });
  observer.observe(input, {
    attributes: true,
    attributeFilter: ["disabled", "readonly", "multiple"],
  });
  return {
    clear: hide,
    destroy() {
      hide();
      observer.disconnect();
      root.remove();
      input.removeEventListener("blur", check);
      input.removeEventListener("input", hide);
      input.removeEventListener("change", hide);
      form?.removeEventListener("reset", reset);
    },
  };
}
