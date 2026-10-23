import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import template from "lodash/template";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

const render = template(
  readFileSync(
    resolve(
      process.cwd(),
      "../plugin/src/Fields/Implementations/PreviewTemplates/location.ejs",
    ),
    "utf8",
  ),
);
it("translates default labels, lookup cues, and deferred-field instructions", () => {
  vi.stubGlobal("Craft", {
    t: (_category: string, text: string) => `translated: ${text}`,
  });
  const data = {
    integration: "places",
    addressFields: "included",
    placeholder: "",
    includedComponents: ["line1", "city"],
  };
  const root = document.createElement("div");
  root.innerHTML = render(data);
  expect(root.querySelector("input")?.placeholder).toBe(
    "translated: Start typing your address...",
  );
  expect(root.textContent).toContain("translated: Address");
  expect(root.textContent).toContain("translated: City");
  root.innerHTML = render({ ...data, addressDisplay: "selected" });
  expect(root.textContent).toContain(
    "translated: Address fields appear after selecting a location.",
  );
  root.innerHTML = render({ ...data, placeholder: "Custom placeholder" });
  expect(root.querySelector("input")?.placeholder).toBe("Custom placeholder");
});
it("shows the address search cue with its default placeholder", () => {
  const root = document.createElement("div");
  root.innerHTML = render({
    integration: "places",
    addressFields: "included",
    placeholder: "",
  });
  expect(
    root
      .querySelector(".location-preview-search input")
      ?.getAttribute("placeholder"),
  ).toBe("Start typing your address...");
  expect(
    root
      .querySelector(".location-preview-search svg")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
});
it.each([true, false])(
  "marks only included required components when required is %s",
  (required) => {
    const root = document.createElement("div");
    root.innerHTML = render({
      addressFields: "included",
      integration: "places",
      placeholder: "",
      required,
      includedComponents: ["line1", "city", "country"],
      requiredComponents: ["line1", "city", "state"],
    });
    const labels = Array.from(
      root.querySelectorAll(".field-required"),
      (marker) => marker.parentElement?.textContent?.trim(),
    );
    expect(labels).toEqual(required ? ["Address *", "City *"] : []);
  },
);

it.each([
  [["line1"], "Address"],
  [["line1", "city"], "Address"],
  [["line1", "line2"], "Address Line 1"],
])("labels included components %j as %s", (includedComponents, label) => {
  const root = document.createElement("div");
  root.innerHTML = render({
    addressFields: "included",
    integration: null,
    includedComponents,
    placeholder: "",
  });
  expect(root.querySelector("div > div > div")?.textContent).toBe(label);
});

it.each(["search", "selected"])(
  "previews %s with the lookup visible and components deferred",
  (addressDisplay) => {
    const root = document.createElement("div");
    root.innerHTML = render({
      addressFields: "included",
      integration: "places",
      addressDisplay,
      placeholder: "",
    });
    expect(root.querySelectorAll("input")).toHaveLength(1);
    expect(root.textContent?.includes("after selecting a location")).toBe(
      addressDisplay === "selected",
    );
  },
);
it.each([
  ["included", null, 6],
  ["included", "google-places-uid", 7],
  ["mapped", null, 1],
])(
  "previews %s fields with integration %s",
  (addressFields, integration, count) => {
    const root = document.createElement("div");
    root.innerHTML = render({
      addressFields,
      integration,
      placeholder: "Find address",
    });
    expect(root.querySelectorAll("input")).toHaveLength(count);
    expect(!!root.querySelector('[placeholder="Find address"]')).toBe(
      count !== 6,
    );
    expect(root.textContent).not.toContain("Preview template error");
  },
);
