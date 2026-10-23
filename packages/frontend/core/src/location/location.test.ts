// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  type AddressComponent,
  extractAddress,
  type LocationConfig,
  locationValue,
  mountLocation,
  type PlacesLibrary,
} from "./location.js";

const part = (
  type: string,
  longText: string,
  shortText = longText,
): AddressComponent => ({ types: [type], longText, shortText });
const address = [
  part("street_number", "123"),
  part("route", "Main Street"),
  part("locality", "Winnipeg"),
  part("administrative_area_level_1", "Manitoba", "MB"),
  part("postal_code", "R3C 1A2"),
  part("country", "Canada", "CA"),
];
let cleanup: (() => void) | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = `<form><label for="address">Address</label><div id="root"><input id="address" name="location[search]"><input data-location-component="line1" name="location[line1]"><input data-location-component="city" name="location[city]"><input data-location-component="line2" name="location[line2]"></div><input name="street"><select name="province"><option value="">Choose</option><option value="mb">Manitoba</option></select><input name="postal"></form><form><input name="street" value="other form"></form>`;
});
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
function setup(
  config: LocationConfig = {},
  fetchFields = vi.fn().mockResolvedValue({}),
) {
  const prediction = {
    text: { toString: () => "123 Main Street, Winnipeg, MB, Canada" },
    toPlace: () => ({ addressComponents: address, fetchFields }),
  };
  const suggest = vi
    .fn()
    .mockResolvedValue({ suggestions: [{ placePrediction: prediction }] });
  const library: PlacesLibrary = {
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: { fetchAutocompleteSuggestions: suggest },
  };
  const input = document.querySelector<HTMLInputElement>("#address")!;
  const changed = vi.fn();
  const load = vi.fn().mockResolvedValue(library);
  const controller = mountLocation(input, config, {
    root: document.querySelector<HTMLElement>("#root")!,
    onChange: changed,
    load,
  });
  cleanup = controller.destroy;
  const type = async (query: string) => {
    input.focus();
    input.value = query;
    input.dispatchEvent(new Event("input"));
    await vi.advanceTimersByTimeAsync(250);
  };
  return { input, suggest, changed, controller, type, load, fetchFields };
}
it("uses localized lookup text when no input label is available", async () => {
  document.querySelector("label")?.remove();
  const { input, type } = setup({
    apiKey: "test",
    messages: {
      placeholder: "Commencez à saisir votre adresse...",
      suggestions: "Suggestions d’adresses",
      results: "Des suggestions sont disponibles.",
    },
  });
  expect(input.placeholder).toBe("Commencez à saisir votre adresse...");
  expect(
    document.querySelector('[role="listbox"]')?.getAttribute("aria-label"),
  ).toBe("Suggestions d’adresses");
  await type("123 Main");
  expect(document.querySelector('[role="status"]')?.textContent).toBe(
    "Des suggestions sont disponibles.",
  );
});
it("normalizes international components and only accepts known string values", () => {
  expect(extractAddress(address)).toMatchObject({
    line1: "123 Main Street",
    city: "Winnipeg",
    state: "Manitoba",
    country: "Canada",
    line2: "",
  });
  expect(
    extractAddress(address, { stateFormat: "code", countryFormat: "code" }),
  ).toMatchObject({ state: "MB", country: "CA" });
  expect(
    extractAddress([
      part("route", "Hauptstraße"),
      part("street_number", "2"),
      part("country", "Germany", "DE"),
      part("postal_town", "London"),
    ]),
  ).toMatchObject({ line1: "Hauptstraße 2", city: "London" });
  expect(
    locationValue({ city: "A", state: ["bad"], unknown: "ignore" }),
  ).toEqual({ city: "A" });
});

it("switches the search icon to a pin after selection and back on edits or reset", async () => {
  const { input, type, controller } = setup();
  const icon = document.querySelector<HTMLElement>(
    "[data-freeform-location-icon]",
  )!;
  expect(input.placeholder).toBe("Start typing your address...");
  expect(icon.dataset.state).toBe("search");
  expect(icon.getAttribute("aria-hidden")).toBe("true");
  await type("123 Main");
  document.querySelector<HTMLElement>("[role=option]")!.click();
  await vi.runAllTimersAsync();
  expect(icon.dataset.state).toBe("selected");
  await type("A different address");
  expect(icon.dataset.state).toBe("search");
  controller.update({ search: "Restored address", city: "Winnipeg" });
  expect(icon.dataset.state).toBe("selected");
  input.form!.reset();
  await vi.runAllTimersAsync();
  expect(icon.dataset.state).toBe("search");
});

it("preserves custom placeholders and icon attributes and cleans up its decoration", () => {
  const input = document.querySelector<HTMLInputElement>("#address")!;
  input.placeholder = "Find my address";
  const icon = document.createElement("span");
  icon.setAttribute("data-freeform-location-icon", "");
  icon.className = "custom-icon";
  input.parentElement!.append(icon);
  const { controller } = setup();
  expect(input.placeholder).toBe("Find my address");
  expect(icon.className).toBe("custom-icon");
  expect(icon.querySelectorAll("svg")).toHaveLength(1);
  controller.destroy();
  cleanup = undefined;
  expect(icon.isConnected).toBe(true);
  expect(icon.querySelector("svg")).toBeNull();
  expect(input.placeholder).toBe("Find my address");
});
it("debounces search, supplies country restrictions, supports keyboard selection and fills mapped fields in this form only", async () => {
  const { input, suggest, type, changed, fetchFields } = setup({
    countries: ["CA"],
    mappings: { line1: "street", state: "province", postalCode: "postal" },
  });
  await type("12");
  expect(suggest).not.toHaveBeenCalled();
  await type("123 Main");
  expect(suggest).toHaveBeenCalledWith(
    expect.objectContaining({
      input: "123 Main",
      includedRegionCodes: ["CA"],
      sessionToken: expect.any(Object),
    }),
  );
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }),
  );
  expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", cancelable: true }),
  );
  await vi.runAllTimersAsync();
  expect(fetchFields).toHaveBeenCalledWith({ fields: ["addressComponents"] });
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ line1: "123 Main Street", city: "Winnipeg" }),
  );
  expect(
    document.querySelector<HTMLInputElement>('[name="street"]')!.value,
  ).toBe("123 Main Street");
  expect(
    document.querySelector<HTMLSelectElement>('[name="province"]')!.value,
  ).toBe("mb");
  expect(
    document.querySelectorAll<HTMLInputElement>('[name="street"]')[1].value,
  ).toBe("other form");
});
it("ignores stale suggestions, escapes prediction text and permits Escape without submitting", async () => {
  const { input, suggest, type } = setup();
  const first = deferred<{ suggestions: unknown[] }>();
  suggest.mockReturnValueOnce(first.promise);
  await type("old query");
  await type("new query");
  first.resolve({ suggestions: [] });
  await vi.runAllTimersAsync();
  expect(input.getAttribute("aria-expanded")).toBe("true");
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  expect(input.getAttribute("aria-expanded")).toBe("false");
});
it("never applies a delayed selection after a newer edit, reset, disabled control or unmount", async () => {
  const details = deferred<unknown>();
  const { input, type, changed, controller } = setup(
    {},
    vi.fn().mockReturnValue(details.promise),
  );
  await type("123 Main");
  document.querySelector<HTMLElement>('[role="option"]')!.click();
  await type("different address");
  details.resolve({});
  await vi.runAllTimersAsync();
  expect(input.value).toBe("different address");
  expect(changed.mock.calls.some(([value]) => value.city === "Winnipeg")).toBe(
    false,
  );
  controller.destroy();
  expect(document.querySelector('[role="listbox"]')).toBeNull();
});
it("preserves manual entry during API errors and clears owned components and targets when cleared", async () => {
  const { input, suggest, type, changed } = setup({
    mappings: { line1: "street" },
  });
  suggest.mockRejectedValueOnce(new Error("failed"));
  await type("Manual address");
  expect(input.value).toBe("Manual address");
  expect(document.querySelector('[role="status"]')!.textContent).toContain(
    "unavailable",
  );
  await type("123 Main");
  document.querySelector<HTMLElement>('[role="option"]')!.click();
  await vi.runAllTimersAsync();
  await type("");
  expect(
    document.querySelector<HTMLInputElement>('[name="street"]')!.value,
  ).toBe("");
  expect(
    document.querySelector<HTMLInputElement>(
      '[data-location-component="line1"]',
    )!.value,
  ).toBe("");
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ search: "", line1: "" }),
  );
});
it("keeps pending suggestions during controlled feedback, handles component edits and resets without leaking state", async () => {
  const { input, controller, changed } = setup();
  input.focus();
  input.value = "123 Main";
  input.dispatchEvent(new Event("input"));
  controller.update(changed.mock.calls.at(-1)![0]);
  await vi.advanceTimersByTimeAsync(250);
  expect(input.getAttribute("aria-expanded")).toBe("true");
  const field = document.querySelector<HTMLInputElement>(
    '[data-location-component="city"]',
  )!;
  field.value = "Manual city";
  field.dispatchEvent(new Event("input"));
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ city: "Manual city" }),
  );
  input.form!.reset();
  await vi.runAllTimersAsync();
  expect(input.value).toBe("");
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ search: "", city: "" }),
  );
});
it("renews the session after selection and does not apply suggestions when focus moves away", async () => {
  const { input, type, suggest } = setup();
  await type("first address");
  const token = suggest.mock.calls[0][0].sessionToken;
  document.querySelector<HTMLElement>('[role="option"]')!.click();
  await vi.runAllTimersAsync();
  await type("second address");
  expect(suggest.mock.calls[1][0].sessionToken).not.toBe(token);
  input.blur();
  expect(input.getAttribute("aria-expanded")).toBe("false");
});
it.each(["reset", "disabled", "component edit"])(
  "does not apply pending details after %s",
  async (action) => {
    const details = deferred<unknown>();
    const { input, type, changed } = setup(
      {},
      vi.fn().mockReturnValue(details.promise),
    );
    await type("123 Main");
    document.querySelector<HTMLElement>('[role="option"]')!.click();
    if (action === "reset") input.form!.reset();
    else if (action === "disabled") input.disabled = true;
    else {
      const city = document.querySelector<HTMLInputElement>(
        '[data-location-component="city"]',
      )!;
      city.value = "Manual city";
      city.dispatchEvent(new Event("input"));
    }
    details.resolve({});
    await vi.runAllTimersAsync();
    expect(
      changed.mock.calls.some(([value]) => value.city === "Winnipeg"),
    ).toBe(false);
  },
);
it("shows prediction text as plain text and preserves unmatched dropdown and manual entry behavior", async () => {
  const { suggest, type, input } = setup({ mappings: { state: "province" } });
  suggest.mockResolvedValueOnce({
    suggestions: [
      {
        placePrediction: {
          text: { toString: () => "<img src=x onerror=alert(1)>" },
          toPlace: () => ({
            addressComponents: [
              part("administrative_area_level_1", "Unknown region"),
            ],
            fetchFields: async () => ({}),
          }),
        },
      },
    ],
  });
  await type("unknown");
  expect(document.querySelector('[role="option"] img')).toBeNull();
  expect(document.querySelector('[role="option"]')!.textContent).toContain(
    "<img",
  );
  document.querySelector<HTMLSelectElement>('[name="province"]')!.value = "mb";
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", cancelable: true }),
  );
  await vi.runAllTimersAsync();
  expect(
    document.querySelector<HTMLSelectElement>('[name="province"]')!.value,
  ).toBe("");
});
it("uses address components in summaries and compares empty Location values correctly", async () => {
  const { formatLocation, matchLocationOption } = await import("./location.js");
  const { formatSummaryValue } = await import("../summary/summary.js");
  const { evaluateCondition } = await import("../conditionals/operators.js");
  expect(
    formatLocation({
      search: "Google result",
      line1: "123 Main",
      city: "Winnipeg",
    }),
  ).toBe("123 Main, Winnipeg");
  expect(
    formatSummaryValue({ type: "location" }, { search: "Manual entry" }, {}),
  ).toBe("Manual entry");
  expect(
    evaluateCondition({ address: {} }, new Set(), {
      field: "address",
      operator: "isEmpty",
    }),
  ).toBe(true);
  expect(
    matchLocationOption("Manitoba", [{ label: "Manitoba", value: "MB" }]),
  ).toBe("MB");
});
it("updates legacy text-field rules when filling or clearing a mapped address", async () => {
  const { type } = setup({ mappings: { line1: "street" } });
  const target = document.querySelector<HTMLInputElement>('[name="street"]')!;
  const dependent = document.createElement("div");
  dependent.hidden = true;
  target.addEventListener("keyup", () => {
    dependent.hidden = !target.value;
  });
  await type("123 Main");
  document.querySelector<HTMLElement>('[role="option"]')!.click();
  await vi.runAllTimersAsync();
  expect(dependent.hidden).toBe(false);
  await type("");
  expect(dependent.hidden).toBe(true);
});

it("keeps hidden-search address groups editable without exposing autocomplete controls or stale lookup text", () => {
  const input = document.querySelector<HTMLInputElement>("#address")!;
  input.type = "hidden";
  const { controller, changed, load } = setup();
  controller.update({ search: "Old lookup", city: "Winnipeg" });
  expect(input.value).toBe("");
  expect(input.getAttribute("role")).toBeNull();
  expect(input.nextElementSibling?.hasAttribute("hidden")).toBe(true);
  const city = document.querySelector<HTMLInputElement>(
    '[data-location-component="city"]',
  )!;
  city.value = "Toronto";
  city.dispatchEvent(new Event("input", { bubbles: true }));
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ search: "", city: "Toronto" }),
  );
  city.value = "";
  city.dispatchEvent(new Event("input", { bubbles: true }));
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ search: "", city: "" }),
  );
  expect(load).not.toHaveBeenCalled();
});

it("keeps pointer and keyboard selection in sync without moving focus out of the search input", async () => {
  const { input, suggest, type, changed } = setup();
  const submit = vi.fn();
  input.form!.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  suggest.mockResolvedValueOnce({
    suggestions: ["Winnipeg", "Toronto"].map((city) => ({
      placePrediction: {
        text: { toString: () => `123 Main Street, ${city}` },
        toPlace: () => ({
          addressComponents: [part("locality", city)],
          fetchFields: async () => ({}),
        }),
      },
    })),
  });
  await type("123 Main");
  const options = document.querySelectorAll<HTMLElement>('[role="option"]');
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }),
  );
  expect(options[0].getAttribute("aria-selected")).toBe("true");
  options[1].dispatchEvent(new Event("pointermove"));
  expect(document.activeElement).toBe(input);
  expect(input.getAttribute("aria-activedescendant")).toBe(options[1].id);
  expect(options[0].getAttribute("aria-selected")).toBe("false");
  expect(options[1].getAttribute("aria-selected")).toBe("true");
  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      cancelable: true,
      bubbles: true,
    }),
  );
  await vi.runAllTimersAsync();
  expect(submit).not.toHaveBeenCalled();
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ city: "Toronto" }),
  );
});

it("clears a pointer highlight when leaving the results and scrolls the keyboard selection into view", async () => {
  const { input, type } = setup();
  await type("123 Main");
  const list = document.querySelector<HTMLElement>('[role="listbox"]')!;
  const option = list.firstElementChild as HTMLElement;
  option.scrollIntoView = vi.fn();
  option.dispatchEvent(new Event("pointermove"));
  list.dispatchEvent(new Event("pointerleave"));
  expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  expect(option.getAttribute("aria-selected")).toBe("false");
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true }),
  );
  expect(option.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  expect(option.getAttribute("aria-selected")).toBe("true");
});

function setupDisplay(addressDisplay: LocationConfig["addressDisplay"]) {
  const root = document.querySelector<HTMLElement>("#root")!;
  const group = document.createElement("div");
  group.setAttribute("data-freeform-location-components", "");
  root.querySelectorAll("[data-location-component]").forEach((field) => {
    group.append(field);
  });
  root.append(group);
  group
    .querySelector("[data-location-component=city]")!
    .setAttribute("data-location-required", "");
  return { ...setup({ apiKey: "test", addressDisplay }), group };
}

it.each(["always", "search", "selected"] as const)(
  "keeps components submitted and resets their visibility in %s display mode",
  async (mode) => {
    const { group, input, type, controller } = setupDisplay(mode);
    const city = group.querySelector<HTMLInputElement>(
      "[data-location-component=city]",
    )!;
    expect(group.hidden).toBe(mode !== "always");
    expect(city.required).toBe(mode === "always");
    await type("123 Main");
    expect(group.hidden).toBe(mode !== "always");
    document.querySelector<HTMLElement>("[role=option]")!.click();
    await vi.runAllTimersAsync();
    expect(city.value).toBe("Winnipeg");
    expect(new FormData(input.form!).get("location[city]")).toBe("Winnipeg");
    expect(group.hidden).toBe(mode === "search");
    expect(city.required).toBe(mode !== "search");
    await type("");
    expect(group.hidden).toBe(mode !== "always");
    controller.update({ city: "Toronto" });
    expect(group.hidden).toBe(mode === "search");
    input.form!.reset();
    await vi.runAllTimersAsync();
    expect(group.hidden).toBe(mode !== "always");
  },
);

it.each(["search", "selected"] as const)(
  "reveals %s address inputs for provider failures and scoped validation errors",
  async (mode) => {
    const { input, group, suggest, type, controller } = setupDisplay(mode);
    const error = Object.assign(new Event("freeform-render-field-errors"), {
      errors: { other: ["Required"] },
    });
    input.form!.dispatchEvent(error);
    expect(group.hidden).toBe(true);
    input.form!.dispatchEvent(
      Object.assign(new Event("freeform-render-field-errors"), {
        errors: { location: ["Required"] },
      }),
    );
    expect(group.hidden).toBe(mode === "search");
    controller.update({}, true);
    expect(group.hidden).toBe(true);
    suggest.mockRejectedValueOnce(new Error("Unavailable"));
    await type("Manual address");
    expect(group.hidden).toBe(false);
    expect(
      group.querySelector<HTMLInputElement>("[data-location-component=city]")!
        .required,
    ).toBe(true);
  },
);

it.each(["search", "selected"] as const)(
  "respects %s visibility when a headless adapter applies server errors",
  async (mode) => {
    const { group, controller } = setupDisplay(mode);
    group
      .querySelector("[data-location-component=city]")!
      .setAttribute("aria-invalid", "true");
    await Promise.resolve();
    expect(group.hidden).toBe(mode === "search");
    group.style.display = "none"; // A framework rerender reapplies its initial style.
    controller.update({});
    expect(group.style.display).toBe(mode === "search" ? "none" : "");
  },
);

it("preserves a template's custom layout when address fields are revealed", async () => {
  const root = document.querySelector<HTMLElement>("#root")!;
  const group = document.createElement("div");
  group.setAttribute("data-freeform-location-components", "");
  group.style.display = "flex";
  root.querySelectorAll("[data-location-component]").forEach((field) => {
    group.append(field);
  });
  root.append(group);
  const { controller } = setup({ apiKey: "test", addressDisplay: "selected" });
  expect(group.style.display).toBe("none");
  controller.update({ city: "Winnipeg" });
  expect(group.hidden).toBe(false);
  expect(group.style.display).toBe("flex");
});
