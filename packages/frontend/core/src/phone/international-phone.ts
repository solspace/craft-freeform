import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

export type InternationalPhoneConfig = {
  international?: boolean;
  defaultCountry?: string | null;
  allowedCountries?: string[];
  examples?: Record<string, string>;
  labels?: { country?: string; search?: string; empty?: string };
};

export function phoneValue(value: string, country?: CountryCode): string {
  const raw = value.trim();
  if (!raw) return "";
  // Preserve invalid input for server validation instead of silently discarding it.
  if (raw.length <= 100 && /^\+?[0-9\s()./-]+$/.test(raw)) {
    const phone = parsePhoneNumberFromString(raw, {
      defaultCountry: country,
      extract: false,
    });
    if (phone?.isValid()) return phone.number;
  }
  return country && !raw.startsWith("+")
    ? `+${getCountryCallingCode(country)} ${raw}`
    : raw;
}

// Several phone fields may share a parent (for example in a custom template).
const positionedParents = new WeakMap<
  HTMLElement,
  { count: number; restore: () => void }
>();
let nextId = 0;
/** Enhances an existing input without changing its id, name, label, or submitted type. */
export function mountInternationalPhone(
  input: HTMLInputElement,
  config: InternationalPhoneConfig,
  onValue?: (value: string) => void,
) {
  const supported = new Set(getCountries());
  const countries = (config.allowedCountries ?? [...supported]).filter(
    (code): code is CountryCode => supported.has(code as CountryCode),
  );
  let country = countries.includes(config.defaultCountry as CountryCode)
    ? (config.defaultCountry as CountryCode)
    : countries[0];
  const initialCountry = country;
  const initialValue = input.value;
  const originalPlaceholder = input.getAttribute("placeholder");
  let lastEmitted: string | undefined;
  const root = document.createElement("div");
  root.className = "freeform-phone-country";
  const button = document.createElement("button");
  button.type = "button";
  const panel = document.createElement("div");
  panel.hidden = true;
  do {
    panel.id = `freeform-phone-countries-${++nextId}`;
  } while (document.getElementById(panel.id));
  button.setAttribute("aria-controls", panel.id);
  button.setAttribute("aria-expanded", "false");
  const search = document.createElement("input");
  search.type = "search";
  search.setAttribute(
    "aria-label",
    config.labels?.search ?? "Search countries",
  );
  search.placeholder = config.labels?.search ?? "Search countries";
  search.autocomplete = "off";
  const list = document.createElement("div");
  list.className = "freeform-phone-options";
  list.id = `${panel.id}-list`;
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", config.labels?.country ?? "Country");
  search.setAttribute("role", "combobox");
  search.setAttribute("aria-controls", list.id);
  search.setAttribute("aria-expanded", "false");
  search.setAttribute("aria-autocomplete", "list");
  const empty = document.createElement("div");
  empty.textContent = config.labels?.empty ?? "No countries found";
  empty.hidden = true;
  empty.setAttribute("role", "status");
  panel.append(search, list, empty);
  root.append(button, panel);
  const next = input.nextElementSibling;
  (next instanceof HTMLLabelElement && next.htmlFor === input.id
    ? next
    : input
  ).after(root);

  const style = (element: HTMLElement, values: Record<string, string>) => {
    for (const [key, value] of Object.entries(values))
      element.style.setProperty(key, value, "important");
  };
  const preserve = (element: HTMLElement, property: string) => {
    const value = element.style.getPropertyValue(property);
    const priority = element.style.getPropertyPriority(property);
    return () => {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    };
  };
  // Overlay the selector without reparenting framework-owned inputs or breaking
  // the input + label relationship used by floating-label templates.
  const parent = input.parentElement!;
  let positioning = positionedParents.get(parent);
  if (!positioning) {
    const restore = preserve(parent, "position");
    const position = getComputedStyle(parent).position;
    if (!position || position === "static")
      style(parent, { position: "relative" });
    positioning = { count: 0, restore };
    positionedParents.set(parent, positioning);
  }
  positioning.count++;
  const restorePadding = preserve(input, "padding-inline-start");
  const inputStyle = getComputedStyle(input);
  const padding =
    inputStyle.paddingInlineStart || inputStyle.paddingLeft || "12px";
  style(input, { "padding-inline-start": `calc(3.5rem + ${padding})` });
  let restoreLabel: (() => void) | undefined;
  if (
    next instanceof HTMLLabelElement &&
    next.htmlFor === input.id &&
    getComputedStyle(next).position === "absolute"
  ) {
    restoreLabel = preserve(next, "padding-inline-start");
    style(next, {
      "padding-inline-start": `calc(3.5rem + ${getComputedStyle(next).paddingInlineStart || padding})`,
    });
  }
  style(root, {
    position: "absolute",
    margin: "0",
    padding: "0",
    border: "0",
    "pointer-events": "none",
    "z-index": "1",
    "box-sizing": "border-box",
    "font-family": inputStyle.fontFamily || "inherit",
    "font-size": inputStyle.fontSize || "1rem",
    "line-height": "1.5",
  });
  style(button, {
    position: "absolute",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    gap: ".5rem",
    "inset-inline-start": "1px",
    top: "1px",
    width: "3.5rem",
    height: "calc(100% - 2px)",
    "min-height": "0",
    margin: "0",
    padding: "0 .5rem",
    border: "0",
    "border-inline-end": "1px solid var(--ff-phone-border, #b8c4d3)",
    "border-start-start-radius": "inherit",
    "border-end-start-radius": "inherit",
    background:
      "linear-gradient(#7488a51a, #7488a51a), var(--ff-phone-selector-background, var(--ff-phone-background, #fff))",
    color: "var(--ff-phone-color, #334155)",
    font: "inherit",
    cursor: "pointer",
    "box-shadow": "none",
    "pointer-events": "auto",
    "box-sizing": "border-box",
  });
  button.className = "freeform-phone-trigger";
  const flag = document.createElement("span");
  flag.setAttribute("aria-hidden", "true");
  style(flag, {
    "font-family":
      '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
    "font-size": "1.25em",
  });
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  style(arrow, {
    width: "0",
    height: "0",
    border: ".3em solid transparent",
    "border-bottom": "0",
    "border-top-color": "currentColor",
  });
  button.append(flag, arrow);
  style(panel, {
    position: "absolute",
    "inset-inline-start": "0",
    top: "calc(100% + .375rem)",
    width: "100%",
    "min-width": "0",
    padding: ".5rem",
    background: "var(--ff-phone-background, #fff)",
    color: "var(--ff-phone-color, #1f2937)",
    border: "1px solid var(--ff-phone-border, #e5e7eb)",
    "border-radius": ".625rem",
    "box-shadow": "0 4px 12px #0002",
    "box-sizing": "border-box",
    "pointer-events": "auto",
  });
  style(search, {
    display: "block",
    width: "100%",
    height: "auto",
    margin: "0 0 .375rem",
    padding: ".5rem .625rem",
    color: "inherit",
    background: "inherit",
    border: "1px solid var(--ff-phone-border, #d1d5db)",
    "border-radius": ".375rem",
    font: "inherit",
    "box-sizing": "border-box",
  });
  style(list, {
    "max-height": "15rem",
    "overflow-y": "auto",
    "overscroll-behavior": "contain",
  });
  style(empty, { padding: ".75rem" });
  const layout = () => {
    style(root, {
      left: `${input.offsetLeft}px`,
      top: `${input.offsetTop}px`,
      width: `${input.offsetWidth}px`,
      height: `${input.offsetHeight}px`,
      "border-radius": getComputedStyle(input).borderRadius,
      display: input.getClientRects().length ? "block" : "none",
    });
  };
  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(layout);
  resizeObserver?.observe(input);
  resizeObserver?.observe(parent);
  window.addEventListener("resize", layout);
  let names: Intl.DisplayNames | undefined;
  try {
    names = new Intl.DisplayNames(
      [
        input.lang ||
          document.documentElement.lang ||
          navigator.language ||
          "en",
      ],
      { type: "region" },
    );
  } catch {
    /* Country codes remain usable in older browsers. */
  }
  const label = (code: CountryCode) =>
    `${names?.of(code) ?? code} (+${getCountryCallingCode(code)})`;
  countries.sort((a, b) => label(a).localeCompare(label(b)));
  const flagFor = (code: CountryCode) =>
    String.fromCodePoint(
      ...[...code].map((letter) => 127397 + letter.charCodeAt(0)),
    );
  let options: HTMLElement[] = [];
  let activeIndex = -1;
  const activate = (index: number, scroll = true) => {
    activeIndex = index;
    options.forEach((option, i) => {
      style(option, {
        background:
          i === index ? "var(--ff-phone-highlight, #7488a51a)" : "transparent",
      });
    });
    const active = options[index];
    if (active) {
      search.setAttribute("aria-activedescendant", active.id);
      if (scroll) active.scrollIntoView?.({ block: "nearest" });
    } else search.removeAttribute("aria-activedescendant");
  };
  const renderOptions = () => {
    const query = search.value.toLocaleLowerCase().trim();
    list.replaceChildren();
    options = [];
    for (const code of countries) {
      if (!`${label(code)} ${code}`.toLocaleLowerCase().includes(query))
        continue;
      const option = document.createElement("div");
      option.id = `${panel.id}-${code}`;
      option.dataset.country = code;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(code === country));
      style(option, {
        display: "flex",
        "align-items": "center",
        gap: ".625rem",
        padding: ".625rem .75rem",
        "min-height": "2.75rem",
        "border-radius": ".375rem",
        cursor: "pointer",
        "box-sizing": "border-box",
      });
      const icon = flag.cloneNode() as HTMLElement;
      icon.textContent = flagFor(code);
      const name = document.createElement("span");
      name.textContent = names?.of(code) ?? code;
      style(name, { "min-width": "0", "overflow-wrap": "anywhere" });
      const dial = document.createElement("span");
      dial.textContent = `+${getCountryCallingCode(code)}`;
      style(dial, {
        "margin-inline-start": "auto",
        "padding-inline-start": ".5rem",
        color: "var(--ff-phone-dial-color, inherit)",
        opacity: ".7",
        "white-space": "nowrap",
        direction: "ltr",
      });
      option.append(icon, name, dial);
      const index = options.length;
      option.addEventListener("pointermove", () => activate(index, false));
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => choose(code));
      options.push(option);
      list.append(option);
    }
    empty.hidden = options.length !== 0;
    activate(
      Math.max(
        0,
        options.findIndex((option) => option.dataset.country === country),
      ),
      false,
    );
  };
  const refresh = () => {
    flag.textContent = country ? flagFor(country) : "🌐";
    const title = `${config.labels?.country ?? "Country"}: ${country ? label(country) : "—"}`;
    button.setAttribute("aria-label", title);
    button.title = title;
    button.disabled =
      input.matches(":disabled") || input.readOnly || countries.length === 0;
    style(button, {
      opacity: button.disabled ? ".5" : "1",
      cursor: button.disabled ? "default" : "pointer",
    });
    if (button.disabled) close();
    if (!originalPlaceholder)
      input.placeholder = country ? (config.examples?.[country] ?? "") : "";
    layout();
  };
  const inferCountry = () => {
    if (input.value.trim().startsWith("+") && input.value.length <= 100) {
      const parsed = parsePhoneNumberFromString(input.value, {
        extract: false,
      });
      if (parsed?.country && countries.includes(parsed.country))
        country = parsed.country;
    }
  };
  const emit = () => {
    inferCountry();
    refresh();
    lastEmitted = phoneValue(input.value, country);
    onValue?.(lastEmitted);
  };
  const close = (focus = false) => {
    panel.hidden = true;
    style(panel, { display: "none" });
    style(root, { "z-index": "1" });
    search.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-expanded", "false");
    if (focus) button.focus();
  };
  const toggle = () => {
    if (input.matches(":disabled") || input.readOnly) return;
    if (!panel.hidden) return close();
    panel.hidden = false;
    style(panel, { display: "block" });
    style(root, { "z-index": "50" });
    search.setAttribute("aria-expanded", "true");
    layout();
    button.setAttribute("aria-expanded", "true");
    search.value = "";
    renderOptions();
    search.focus();
    activate(activeIndex);
  };
  const choose = (selected: CountryCode) => {
    if (input.matches(":disabled") || input.readOnly) return close();
    if (!countries.includes(selected)) return;
    // Reinterpret the national number in the newly selected country.
    const parsed =
      input.value.length <= 100
        ? parsePhoneNumberFromString(input.value, {
            defaultCountry: country,
            extract: false,
          })
        : undefined;
    if (input.value.trim().startsWith("+") && parsed)
      input.value = parsed.nationalNumber;
    country = selected;
    emit();
    close(true);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
    if (event.target !== search) return;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const index =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : activeIndex + (event.key === "ArrowDown" ? 1 : -1);
      activate(Math.max(0, Math.min(options.length - 1, index)));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const selected = options[activeIndex]?.dataset.country as
        | CountryCode
        | undefined;
      if (selected) choose(selected);
    }
  };
  const focusout = (event: FocusEvent) => {
    if (!root.contains(event.relatedTarget as Node)) close();
  };
  const outside = (event: Event) => {
    if (!root.contains(event.target as Node)) close();
  };
  const blur = () => {
    emit();
    const parsed =
      input.value.length <= 100
        ? parsePhoneNumberFromString(input.value, {
            defaultCountry: country,
            extract: false,
          })
        : undefined;
    if (parsed?.isValid()) input.value = parsed.formatInternational();
  };
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (event.defaultPrevented) return;
      country = initialCountry;
      input.value = initialValue;
      close();
      emit();
    });
  button.addEventListener("click", toggle);
  search.addEventListener("input", renderOptions);
  root.addEventListener("keydown", keydown);
  root.addEventListener("focusout", focusout);
  input.addEventListener("input", emit);
  input.addEventListener("change", emit);
  input.addEventListener("blur", blur);
  document.addEventListener("click", outside);
  input.form?.addEventListener("reset", reset);
  const form = input.form;
  const observer = new MutationObserver(refresh);
  observer.observe(input, {
    attributes: true,
    attributeFilter: ["disabled", "readonly"],
  });
  close();
  inferCountry();
  refresh();
  let destroyed = false;
  return {
    getValue: () => phoneValue(input.value, country),
    update(value: string) {
      if (value === lastEmitted) return;
      input.value = value;
      if (!value) country = initialCountry;
      inferCountry();
      refresh();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", layout);
      restorePadding();
      restoreLabel?.();
      if (--positioning.count === 0) {
        positioning.restore();
        positionedParents.delete(parent);
      }
      root.remove();
      input.removeEventListener("input", emit);
      input.removeEventListener("change", emit);
      input.removeEventListener("blur", blur);
      document.removeEventListener("click", outside);
      form?.removeEventListener("reset", reset);
      if (originalPlaceholder === null) input.removeAttribute("placeholder");
      else input.setAttribute("placeholder", originalPlaceholder);
    },
  };
}
