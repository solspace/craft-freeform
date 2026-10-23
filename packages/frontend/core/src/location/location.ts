import {
  createLocationSuggestion,
  mountLocationSearchIcon,
  styleLocationSuggestions,
} from "./location.appearance.js";

export const locationComponents = [
  "line1",
  "line2",
  "city",
  "state",
  "postalCode",
  "country",
] as const;
export type LocationComponent = (typeof locationComponents)[number];
export type LocationValue = Partial<
  Record<LocationComponent | "search", string>
>;
export type LocationConfig = {
  apiKey?: string;
  showSearch?: boolean;
  mode?: "included" | "mapped";
  addressDisplay?: "always" | "search" | "selected";
  components?: LocationComponent[];
  requiredComponents?: LocationComponent[];
  labels?: Partial<Record<LocationComponent, string>>;
  countries?: string[];
  stateFormat?: string;
  countryFormat?: string;
  mappings?: Partial<Record<LocationComponent, string>>;
  messages?: {
    suggestions?: string;
    placeholder?: string;
    unavailable?: string;
    noResults?: string;
    results?: string;
  };
};
export type AddressComponent = {
  types: string[];
  longText?: string;
  shortText?: string;
};
type Place = {
  addressComponents?: AddressComponent[];
  fetchFields(options: { fields: string[] }): Promise<unknown>;
};
type Prediction = { text: { toString(): string }; toPlace(): Place };
export type PlacesLibrary = {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(
      request: Record<string, unknown>,
    ): Promise<{ suggestions: { placePrediction?: Prediction }[] }>;
  };
};
type MapsWindow = Window & {
  google?: { maps?: { importLibrary?(name: string): Promise<unknown> } };
  __freeformPlacesReady?: () => void;
  __freeformPlacesLoad?: Promise<PlacesLibrary>;
};

// Reuse an existing Maps loader. Keep one promise on window across separately bundled forms.
export function loadGooglePlaces(apiKey: string): Promise<PlacesLibrary> {
  const host = window as MapsWindow;
  if (host.google?.maps?.importLibrary)
    return host.google.maps.importLibrary("places") as Promise<PlacesLibrary>;
  if (host.__freeformPlacesLoad) return host.__freeformPlacesLoad;
  host.__freeformPlacesLoad = new Promise<PlacesLibrary>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    const script = existing ?? document.createElement("script");
    const fail = () => {
      cleanup();
      if (!existing) script.remove();
      reject(new Error("Address search unavailable"));
    };
    const ready = async () => {
      cleanup();
      try {
        const library = await host.google?.maps?.importLibrary?.("places");
        if (!library) throw new Error("Address search unavailable");
        resolve(library as PlacesLibrary);
      } catch {
        reject(new Error("Address search unavailable"));
      }
    };
    const timeout = window.setTimeout(fail, 15000);
    function cleanup() {
      clearTimeout(timeout);
      script.removeEventListener("error", fail);
      script.removeEventListener("load", ready);
      delete host.__freeformPlacesReady;
    }
    script.addEventListener("error", fail, { once: true });
    if (existing) script.addEventListener("load", ready, { once: true });
    else {
      host.__freeformPlacesReady = ready;
      const url = new URL("https://maps.googleapis.com/maps/api/js");
      url.search = new URLSearchParams({
        key: apiKey,
        loading: "async",
        v: "weekly",
        callback: "__freeformPlacesReady",
      }).toString();
      script.src = url.toString();
      script.async = true;
      document.head.append(script);
    }
  }).catch((error) => {
    delete host.__freeformPlacesLoad;
    throw error;
  });
  return host.__freeformPlacesLoad;
}

export function locationValue(value: unknown): LocationValue {
  if (typeof value === "string") return { search: value };
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    ["search", ...locationComponents].flatMap((key) =>
      typeof (value as Record<string, unknown>)[key] === "string"
        ? [[key, (value as Record<string, string>)[key]]]
        : [],
    ),
  );
}

export function formatLocation(value: unknown): string {
  const address = locationValue(value);
  const parts = locationComponents
    .map((key) => address[key]?.trim() ?? "")
    .filter(Boolean);
  return parts.length ? parts.join(", ") : (address.search ?? "").trim();
}

export function matchLocationOption(
  value: string,
  options: { value: string; label: string }[],
): string {
  const normalized = value.trim().toLocaleLowerCase();
  return (
    options.find(
      (option) =>
        option.value.toLocaleLowerCase() === normalized ||
        option.label.trim().toLocaleLowerCase() === normalized,
    )?.value ?? ""
  );
}

export function extractAddress(
  components: AddressComponent[],
  config: LocationConfig = {},
): LocationValue {
  const part = (type: string, short = false) => {
    const component = components.find((item) => item.types.includes(type));
    return (short ? component?.shortText : component?.longText) ?? "";
  };
  const countryCode = part("country", true);
  const number = part("street_number");
  const street = part("route");
  // Street numbers follow the road name in these address formats.
  const streetFirst = [
    "DE",
    "AT",
    "CH",
    "NL",
    "BE",
    "DK",
    "NO",
    "SE",
    "FI",
    "IS",
    "BR",
  ].includes(countryCode);
  const postalCode = [part("postal_code"), part("postal_code_suffix")]
    .filter(Boolean)
    .join("-");
  return {
    line1:
      (streetFirst ? [street, number] : [number, street])
        .filter(Boolean)
        .join(" ") || part("premise"),
    line2: part("subpremise"),
    city:
      part("postal_town") ||
      part("locality") ||
      part("sublocality_level_1") ||
      part("administrative_area_level_2"),
    state: part("administrative_area_level_1", config.stateFormat === "code"),
    postalCode,
    country: part("country", config.countryFormat === "code"),
  };
}

export type LocationController = {
  destroy(): void;
  update(value: unknown, force?: boolean): void;
};
export function mountLocation(
  input: HTMLInputElement,
  config: LocationConfig,
  options: {
    root?: HTMLElement;
    onChange?: (value: LocationValue) => void;
    onMap?: (handle: string, value: string) => void;
    load?: () => Promise<PlacesLibrary>;
  } = {},
): LocationController {
  const root = options.root ?? input.parentElement!;
  const hasSearch = input.type !== "hidden";
  let value: LocationValue = { search: input.value };
  const fields = new Map<LocationComponent, HTMLInputElement>();
  root
    .querySelectorAll<HTMLInputElement>("[data-location-component]")
    .forEach((field) => {
      const key = field.dataset.locationComponent as LocationComponent;
      if (locationComponents.includes(key)) {
        fields.set(key, field);
        value[key] = field.value;
      }
    });
  const components = root.querySelector<HTMLElement>(
    "[data-freeform-location-components]",
  );
  const display =
    hasSearch && (config.apiKey || options.load) && config.mode !== "mapped"
      ? (config.addressDisplay ?? "always")
      : "always";
  const originalPlaceholder = input.getAttribute("placeholder");
  if (hasSearch && !input.placeholder.trim())
    input.placeholder =
      config.messages?.placeholder ?? "Start typing your address...";
  const searchIcon = hasSearch ? mountLocationSearchIcon(input) : undefined;
  const syncRestoredIcon = () =>
    searchIcon?.setSelected(
      Boolean(
        value.search?.trim() &&
          locationComponents.some((key) => value[key]?.trim()),
      ),
    );
  syncRestoredIcon();
  let revealComponents =
    display !== "search" &&
    Boolean(root.querySelector('[aria-invalid="true"]'));
  const componentDisplay =
    components?.style.display !== "none"
      ? (components?.style.display ?? "")
      : "";
  const syncComponentVisibility = () => {
    if (!components) return;
    const hasAddress = locationComponents.some((key) => value[key]?.trim());
    const visible =
      display === "always" ||
      revealComponents ||
      (display === "selected" && hasAddress);
    components.hidden = !visible;
    components.style.display = visible ? componentDisplay : "none";
    fields.forEach((field) => {
      field.required =
        visible &&
        field.type !== "hidden" &&
        field.hasAttribute("data-location-required");
    });
  };
  syncComponentVisibility();
  const errorObserver = new MutationObserver(() => {
    if (display !== "search" && root.querySelector('[aria-invalid="true"]')) {
      revealComponents = true;
      syncComponentVisibility();
    }
  });
  errorObserver.observe(root, {
    attributes: true,
    attributeFilter: ["aria-invalid"],
    subtree: true,
  });
  const onFieldErrors = (
    event: Event & { errors?: Record<string, string[]> },
  ) => {
    const handle = input.name.replace(/\[search\]$/, "");
    if (display !== "search" && event.errors?.[handle]?.length) {
      revealComponents = true;
      syncComponentVisibility();
    }
  };
  input.form?.addEventListener("freeform-render-field-errors", onFieldErrors);
  const savedAttributes = [
    "role",
    "aria-autocomplete",
    "aria-expanded",
    "aria-controls",
    "aria-activedescendant",
  ].map((name) => [name, input.getAttribute(name)] as const);
  const anchor = document.createElement("div");
  anchor.style.cssText = "position:relative;width:100%;";
  anchor.hidden = !hasSearch;
  input.after(anchor);
  const panel = document.createElement("div");
  panel.className = "freeform-location-suggestions";
  panel.hidden = true;
  const list = document.createElement("div");
  list.id = `freeform-location-${++mountId}`;
  list.setAttribute("role", "listbox");
  list.setAttribute(
    "aria-label",
    input.labels?.[0]?.textContent ||
      config.messages?.suggestions ||
      "Address suggestions",
  );
  const attribution = document.createElement("div");
  attribution.textContent = "Google Maps";
  attribution.translate = false;
  panel.append(list, attribution);
  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.style.cssText = "font-size:.85em;line-height:1.5;margin-top:4px;";
  anchor.append(panel, status);
  const announce = (message: string, visible = true) => {
    status.style.cssText = visible
      ? "font-size:.85em;line-height:1.5;margin-top:4px;"
      : "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
    status.textContent = message;
  };
  if (hasSearch) {
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", list.id);
    input.setAttribute("aria-expanded", "false");
  }
  let applying = false;
  let destroyed = false;
  let version = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let session: object | undefined;
  let library: PlacesLibrary | undefined;
  let predictions: Prediction[] = [];
  let active = -1;
  const notify = () => options.onChange?.({ ...value });
  const hide = () => {
    panel.hidden = true;
    status.textContent = "";
    active = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  };
  const cancel = () => {
    version++;
    clearTimeout(timer);
    hide();
  };
  const usable = () =>
    !destroyed &&
    input.isConnected &&
    !input.matches(":disabled") &&
    !input.readOnly;
  const unavailable = () => {
    hide();
    revealComponents = true;
    syncComponentVisibility();
    announce(
      config.messages?.unavailable ??
        "Address search is unavailable. Please enter your address manually.",
    );
  };
  const map = (key: LocationComponent, next: string) => {
    const handle = config.mappings?.[key];
    if (!handle) return;
    if (options.onMap) {
      options.onMap(handle, next);
      return;
    }
    // Resolve by name inside this form, never by a global ID or CSS selector.
    const targets = Array.from(input.form?.elements ?? []).filter(
      (element): element is HTMLInputElement | HTMLSelectElement =>
        (element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement) &&
        element.name === handle,
    );
    for (const target of targets) {
      if (
        target.matches(":disabled") ||
        (target instanceof HTMLInputElement && target.readOnly)
      )
        continue;
      let mapped = next;
      if (target instanceof HTMLSelectElement) {
        const match = Array.from(target.options).find(
          (option) =>
            !option.disabled &&
            (option.value.toLocaleLowerCase() === next.toLocaleLowerCase() ||
              option.text.trim().toLocaleLowerCase() ===
                next.toLocaleLowerCase()),
        );
        mapped = match?.value ?? "";
      }
      target.value = mapped;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      // Legacy text-field rules listen for keyup.
      target.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    }
  };
  const choose = async (prediction: Prediction) => {
    const requestVersion = ++version;
    clearTimeout(timer);
    hide();
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents"] });
      if (!usable() || requestVersion !== version) return;
      const address = extractAddress(place.addressComponents ?? [], config);
      value = { search: prediction.text.toString(), ...address };
      searchIcon?.setSelected(true);
      input.value = value.search ?? "";
      applying = true;
      for (const [key, field] of fields) {
        field.value = value[key] ?? "";
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
      applying = false;
      syncComponentVisibility();
      for (const key of locationComponents) map(key, value[key] ?? "");
      notify();
      // Other form listeners (rules, summaries and custom integrations) see the selection.
      input.dispatchEvent(new Event("change", { bubbles: true }));
      status.textContent = "";
      session = undefined;
    } catch {
      if (usable() && requestVersion === version) {
        session = undefined;
        unavailable();
      }
    }
  };
  const highlight = (index: number) => {
    active = index;
    Array.from(list.children).forEach((element, i) => {
      element.setAttribute("aria-selected", String(i === index));
      (element as HTMLElement).style.background =
        i === index
          ? "var(--ff-location-highlight,rgba(127,127,127,.16))"
          : "transparent";
    });
    if (index >= 0)
      input.setAttribute("aria-activedescendant", `${list.id}-${index}`);
    else input.removeAttribute("aria-activedescendant");
  };
  list.addEventListener("pointerleave", () => highlight(-1));
  const search = async (query: string, requestVersion: number) => {
    try {
      library ??= await (options.load?.() ?? loadGooglePlaces(config.apiKey!));
      if (!usable() || requestVersion !== version) return;
      session ??= new library.AutocompleteSessionToken();
      const { suggestions } =
        await library.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          sessionToken: session,
          includedPrimaryTypes: ["street_address", "premise", "subpremise"],
          ...(config.countries?.length
            ? { includedRegionCodes: config.countries }
            : {}),
        });
      if (
        !usable() ||
        requestVersion !== version ||
        document.activeElement !== input
      )
        return;
      predictions = suggestions.flatMap((item) =>
        item.placePrediction ? [item.placePrediction] : [],
      );
      list.replaceChildren();
      if (!predictions.length) {
        hide();
        revealComponents = true;
        syncComponentVisibility();
        announce(
          config.messages?.noResults ??
            "No matching addresses. You can enter your address manually.",
        );
        return;
      }
      predictions.forEach((prediction, index) => {
        const option = createLocationSuggestion(prediction.text.toString());
        option.id = `${list.id}-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.addEventListener("pointermove", () => highlight(index));
        option.addEventListener("mousedown", (event) => event.preventDefault());
        option.addEventListener("click", () => void choose(prediction));
        list.append(option);
      });
      active = -1;
      styleLocationSuggestions(input, panel, list, attribution);
      panel.hidden = false;
      input.setAttribute("aria-expanded", "true");
      announce(
        config.messages?.results ??
          "Address suggestions available. Use the arrow keys to choose an address.",
        false,
      );
    } catch {
      if (usable() && requestVersion === version) unavailable();
    }
  };
  const onInput = () => {
    searchIcon?.setSelected(false);
    cancel();
    value.search = input.value;
    status.textContent = "";
    // Clearing the lookup clears the address it owns and its configured targets.
    if (!input.value.trim()) {
      session = undefined;
      revealComponents = false;
      value = { search: "" };
      for (const [key, field] of fields) {
        field.value = "";
        value[key] = "";
      }
      for (const key of locationComponents) map(key, "");
      syncComponentVisibility();
    }
    notify();
    if (
      (!config.apiKey && !options.load) ||
      !usable() ||
      input.value.trim().length < 3
    )
      return;
    const query = input.value;
    const requestVersion = version;
    timer = setTimeout(() => void search(query, requestVersion), 250);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      cancel();
      status.textContent = "";
    }
    if (panel.hidden) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      highlight(
        active < 0
          ? event.key === "ArrowDown"
            ? 0
            : predictions.length - 1
          : (active +
              (event.key === "ArrowDown" ? 1 : -1) +
              predictions.length) %
              predictions.length,
      );
      (list.children[active] as HTMLElement)?.scrollIntoView?.({
        block: "nearest",
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      // The classic form also handles Enter; selecting a result must not submit it.
      event.stopPropagation();
      void choose(predictions[active < 0 ? 0 : active]);
    } else if (event.key === "Tab") cancel();
  };
  const onBlur = () => cancel();
  const onReset = () => {
    cancel();
    session = undefined;
    status.textContent = "";
    queueMicrotask(() => {
      if (destroyed) return;
      value = { search: input.value };
      for (const [key, field] of fields) value[key] = field.value;
      syncRestoredIcon();
      revealComponents = false;
      syncComponentVisibility();
      notify();
    });
  };
  const componentListeners: (() => void)[] = [];
  for (const [key, field] of fields) {
    const listener = () => {
      if (applying) return;
      cancel();
      value[key] = field.value;
      syncComponentVisibility();
      if (!hasSearch) input.value = value.search = "";
      notify();
    };
    field.addEventListener("input", listener);
    componentListeners.push(() => field.removeEventListener("input", listener));
  }
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKey);
  input.addEventListener("blur", onBlur);
  input.form?.addEventListener("reset", onReset);
  return {
    update(next, force = false) {
      const normalized = locationValue(next);
      if (!hasSearch) normalized.search = "";
      if (
        !force &&
        ["search", ...locationComponents].every(
          (key) =>
            (normalized[key as keyof LocationValue] ?? "") ===
            (value[key as keyof LocationValue] ?? ""),
        )
      ) {
        if (display !== "search" && root.querySelector('[aria-invalid="true"]'))
          revealComponents = true;
        syncComponentVisibility();
        return;
      }
      cancel();
      value = normalized;
      syncRestoredIcon();
      input.value = value.search ?? "";
      for (const [key, field] of fields) field.value = value[key] ?? "";
      if (force) revealComponents = false;
      syncComponentVisibility();
      status.textContent = "";
    },
    destroy() {
      destroyed = true;
      cancel();
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKey);
      input.removeEventListener("blur", onBlur);
      input.form?.removeEventListener("reset", onReset);
      input.form?.removeEventListener(
        "freeform-render-field-errors",
        onFieldErrors,
      );
      errorObserver.disconnect();
      componentListeners.forEach((remove) => {
        remove();
      });
      anchor.remove();
      searchIcon?.destroy();
      if (originalPlaceholder === null) input.removeAttribute("placeholder");
      else input.setAttribute("placeholder", originalPlaceholder);
      for (const [name, original] of savedAttributes) {
        if (original === null) input.removeAttribute(name);
        else input.setAttribute(name, original);
      }
    },
  };
}
let mountId = 0;
