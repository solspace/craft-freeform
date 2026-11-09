export type NumberConfig = {
  decimalCount?: number;
  allowNegative?: boolean;
  min?: number | null;
  max?: number | null;
  step?: number;
  error?: {
    tag?: string;
    itemTag?: string;
    attributes?: Record<string, string | boolean | null>;
  };
  messages?: Partial<
    Record<
      | "numeric"
      | "whole"
      | "decimals"
      | "negative"
      | "min"
      | "max"
      | "range"
      | "step",
      string
    >
  >;
};

const messages = {
  numeric: "Enter a number.",
  whole: "Enter a whole number.",
  decimals: "Use no more than {limit} decimal places.",
  negative: "Enter zero or a positive number.",
  min: "Enter a number greater than or equal to {min}.",
  max: "Enter a number less than or equal to {max}.",
  range: "Enter a number between {min} and {max}.",
  step: "Enter a number in increments of {step}.",
};

function message(
  config: NumberConfig,
  key: keyof typeof messages,
  values: Record<string, unknown> = {},
) {
  return (config.messages?.[key] ?? messages[key]).replace(
    /\{(\w+)\}/g,
    (token, name) => String(values[name] ?? token),
  );
}

export function numberInputAttributes(config: NumberConfig = {}) {
  const precision = Math.max(0, config.decimalCount ?? 0);
  const configuredStep = config.step ?? 1;
  const step =
    configuredStep <= 0 || (configuredStep === 1 && precision > 0)
      ? 10 ** -Math.min(15, precision)
      : configuredStep;
  return {
    inputMode: config.allowNegative
      ? ("text" as const)
      : precision > 0
        ? ("decimal" as const)
        : ("numeric" as const),
    min: config.allowNegative
      ? (config.min ?? undefined)
      : Math.max(0, config.min ?? 0),
    max: config.max ?? undefined,
    step,
  };
}

/** Validate submitted digits without rounding, clamping or changing the visitor's input. */
export function getNumberError(
  value: string,
  config: NumberConfig = {},
): string | undefined {
  const raw = value.trim();
  if (!raw) return;
  const match = /^([+-]?)(\d*)(?:[.,](\d*))?(?:[eE]([+-]?\d+))?$/.exec(raw);
  const numeric = Number(raw.replace(",", "."));
  if (!match || !(match[2] + (match[3] ?? "")) || !Number.isFinite(numeric))
    return message(config, "numeric");
  const places = Math.max(0, (match[3]?.length ?? 0) - Number(match[4] ?? 0));
  const precision = Math.max(0, config.decimalCount ?? 0);
  if (places > precision)
    return precision === 0
      ? message(config, "whole")
      : message(config, "decimals", { limit: precision });
  if (!config.allowNegative && numeric < 0) return message(config, "negative");
  const { min, max } = config;
  if ((min != null && numeric < min) || (max != null && numeric > max)) {
    return message(
      config,
      min != null && max != null ? "range" : min != null ? "min" : "max",
      { min, max },
    );
  }
}

let nextId = 0;

/** Render inline feedback for classic forms, or delegate its rendering to React/Vue. */
export function mountNumber(
  input: HTMLInputElement,
  config: NumberConfig = {},
  onError?: (message: string) => void,
) {
  let error: HTMLElement | undefined;
  let previousAriaInvalid: string | null = null;
  let lastMessage = "";
  const display = (text: string) => {
    if (onError) {
      if (text !== lastMessage) onError(text);
      lastMessage = text;
      return;
    }
    if (error) {
      const ids = (input.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((id) => id && id !== error!.id);
      if (ids.length) input.setAttribute("aria-describedby", ids.join(" "));
      else input.removeAttribute("aria-describedby");
      error.remove();
      error = undefined;
      if (previousAriaInvalid == null) input.removeAttribute("aria-invalid");
      else input.setAttribute("aria-invalid", previousAriaInvalid);
    }
    if (!text) return;
    previousAriaInvalid = input.getAttribute("aria-invalid");
    const appearance = config.error;
    const tag = appearance?.tag ?? "ul";
    error = document.createElement(
      ["ul", "ol", "div", "p", "span"].includes(tag) ? tag : "ul",
    );
    for (const [name, value] of Object.entries(appearance?.attributes ?? {})) {
      if (
        value == null ||
        value === false ||
        !/^(?:class|id|style|role|title|lang|dir|aria-[\w-]+|data-[\w-]+)$/.test(
          name,
        )
      )
        continue;
      error.setAttribute(name, value === true ? "" : value);
    }
    if (!error.id || document.getElementById(error.id)) {
      do {
        error.id = `freeform-number-error-${++nextId}`;
      } while (document.getElementById(error.id));
    }
    if (!error.className) error.className = "errors";
    error.classList.add("freeform-number-error");
    error.dataset.fieldErrors = "";
    if (!error.hasAttribute("role")) error.setAttribute("role", "status");
    if (!error.hasAttribute("aria-live"))
      error.setAttribute("aria-live", "polite");
    const itemTag = appearance?.itemTag ?? "li";
    const item = document.createElement(
      ["li", "ul", "ol", "div", "p", "span"].includes(itemTag) ? itemTag : "li",
    );
    item.textContent = text;
    error.appendChild(item);
    // Standalone/custom renderers without compiled error attributes still get readable red feedback.
    if (!appearance)
      error.style.color = "var(--ff-color-danger, var(--bs-danger, #dc3545))";
    // Keep floating labels adjacent to their inputs and feedback inside the field's column.
    const next = input.nextElementSibling;
    const anchor =
      next instanceof HTMLLabelElement && next.htmlFor === input.id
        ? next
        : input;
    anchor.after(error);
    input.setAttribute(
      "aria-describedby",
      [
        ...new Set(
          (input.getAttribute("aria-describedby") ?? "")
            .split(/\s+/)
            .filter(Boolean),
        ),
        error.id,
      ].join(" "),
    );
    input.setAttribute("aria-invalid", "true");
  };
  const clear = () => {
    display("");
  };
  const validate = () => {
    if (
      input.matches(":disabled") ||
      input.readOnly ||
      input.closest("[data-hidden], [hidden]")
    ) {
      clear();
      return true;
    }
    let text = input.validity.badInput
      ? message(config, "numeric")
      : getNumberError(input.value, config);
    if (!text && input.value && input.validity.stepMismatch)
      text = message(config, "step", { step: input.step });
    // This feedback is supplemental; normal browser/server validation controls submission.
    display(text ?? "");
    return !text;
  };
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (!event.defaultPrevented) clear();
    });
  input.addEventListener("blur", validate);
  input.addEventListener("invalid", validate);
  input.addEventListener("input", clear);
  input.form?.addEventListener("reset", reset);
  return {
    validate,
    clear,
    destroy() {
      clear();
      input.removeEventListener("blur", validate);
      input.removeEventListener("invalid", validate);
      input.removeEventListener("input", clear);
      input.form?.removeEventListener("reset", reset);
    },
  };
}
