import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import DOMPurify from "dompurify";
import template from "lodash/template";
import { expect, it } from "vitest";

const render = template(
  readFileSync(
    resolve(
      import.meta.dirname,
      "../../../../../../../../plugin/src/Fields/Implementations/PreviewTemplates/multiple-select.ejs",
    ),
    "utf8",
  ),
);
const generatedOptions = [
  { label: "Choose...", value: "" },
  {
    label: "Provinces",
    children: [
      { label: "Alberta", value: "ab" },
      { label: "British Columbia", value: "bc" },
      { label: "Manitoba", value: "mb" },
    ],
  },
];

it("previews searchable selections as escaped tags without changing saved defaults", () => {
  const defaultValue = ["mb"];
  const host = document.createElement("div");
  host.innerHTML = DOMPurify.sanitize(
    render({ enableSearch: true, generatedOptions, defaultValue }),
  );
  expect(host.querySelector("select[multiple]")).toBeNull();
  expect(host.querySelector("input")?.placeholder).toBe("Search options...");
  expect(host.querySelector("[data-preview-tags]")?.textContent).toContain(
    "Manitoba",
  );
  expect(defaultValue).toEqual(["mb"]);

  host.innerHTML = render({
    enableSearch: true,
    generatedOptions: [{ label: '<img src=x onerror="alert(1)">', value: "x" }],
    defaultValue: [],
  });
  expect(host.querySelector("img")).toBeNull();
  expect(host.querySelector("[data-preview-tags]")?.textContent).toContain(
    "<img",
  );
});

it("uses two available options as examples when there are no defaults", () => {
  const host = document.createElement("div");
  host.innerHTML = render({
    enableSearch: true,
    generatedOptions,
    defaultValue: [],
  });
  expect(host.querySelector("[data-preview-tags]")?.textContent).toContain(
    "Alberta",
  );
  expect(host.querySelector("[data-preview-tags]")?.textContent).toContain(
    "British Columbia",
  );
  expect(host.querySelector("[data-preview-tags]")?.textContent).not.toContain(
    "Manitoba",
  );
});

it.each([false, undefined])(
  "keeps the native list when search is %s",
  (enableSearch) => {
    const host = document.createElement("div");
    host.innerHTML = render({
      enableSearch,
      generatedOptions,
      defaultValue: ["mb"],
    });
    expect(host.querySelector("select[multiple]")).not.toBeNull();
    expect(host.querySelector<HTMLOptionElement>("option:checked")?.value).toBe(
      "mb",
    );
    expect(host.querySelector("[data-preview-tags]")).toBeNull();
  },
);
