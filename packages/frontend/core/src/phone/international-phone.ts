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
  const select = document.createElement("select");
  select.size = 6;
  select.setAttribute("aria-label", config.labels?.country ?? "Country");
  const empty = document.createElement("div");
  empty.textContent = config.labels?.empty ?? "No countries found";
  empty.hidden = true;
  empty.setAttribute("role", "status");
  panel.append(search, select, empty);
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
  style(root, {
    position: "relative",
    "margin-top": ".375rem",
    "font-size": ".875rem",
  });
  style(button, {
    display: "inline-block",
    width: "auto",
    "min-height": "28px",
    margin: "0",
    padding: ".125rem .25rem",
    border: "0",
    "border-radius": ".25rem",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    "text-align": "start",
    cursor: "pointer",
    "box-shadow": "none",
  });
  style(panel, {
    position: "absolute",
    "z-index": "50",
    "inset-inline-start": "0",
    top: "100%",
    width: "min(22rem, 100%)",
    "min-width": "min(16rem, 100%)",
    padding: ".5rem",
    background: "var(--ff-phone-background, #fff)",
    color: "var(--ff-phone-color, #1f2937)",
    border: "1px solid var(--ff-phone-border, #d1d5db)",
    "border-radius": ".5rem",
    "box-shadow": "0 8px 24px #0002",
    "box-sizing": "border-box",
  });
  for (const element of [search, select]) {
    style(element, {
      width: "100%",
      margin: "0",
      padding: ".5rem",
      color: "inherit",
      background: "inherit",
      border: "1px solid var(--ff-phone-border, #d1d5db)",
      "border-radius": ".25rem",
      "font-size": ".875rem",
      "font-family": "inherit",
      "line-height": "1.5",
      "box-sizing": "border-box",
    });
  }
  style(select, {
    height: "10rem",
    "margin-top": ".5rem",
    "background-image": "none",
  });
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
  const renderOptions = () => {
    const query = search.value.toLocaleLowerCase().trim();
    select.replaceChildren();
    for (const code of countries) {
      if (!`${label(code)} ${code}`.toLocaleLowerCase().includes(query))
        continue;
      select.add(new Option(label(code), code, false, code === country));
    }
    empty.hidden = select.options.length !== 0;
    select.hidden = !empty.hidden;
    style(select, { display: select.hidden ? "none" : "block" });
  };
  const refresh = () => {
    button.textContent = `${config.labels?.country ?? "Country"}: ${country ? label(country) : "—"} ▾`;
    button.disabled =
      input.matches(":disabled") || input.readOnly || countries.length === 0;
    if (!originalPlaceholder)
      input.placeholder = country ? (config.examples?.[country] ?? "") : "";
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
    button.setAttribute("aria-expanded", "false");
    if (focus) button.focus();
  };
  const toggle = () => {
    if (input.matches(":disabled") || input.readOnly) return;
    if (!panel.hidden) return close();
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    search.value = "";
    renderOptions();
    search.focus();
  };
  const choose = () => {
    const selected = select.value as CountryCode;
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
    if (event.key === "ArrowDown" && event.target === search) {
      event.preventDefault();
      select.focus();
    }
    if (event.key === "Enter" && event.target === search) {
      event.preventDefault();
      if (select.options.length) choose();
    }
    if (event.key === "Enter" && event.target === select) {
      event.preventDefault();
      choose();
    }
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
  select.addEventListener("change", choose);
  root.addEventListener("keydown", keydown);
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
  inferCountry();
  refresh();
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
      observer.disconnect();
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
