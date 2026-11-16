import { afterEach, expect, it } from "vitest";
import { attachProfileFormats } from "./profile-formats";

afterEach(() => document.body.replaceChildren());

function mount() {
  document.body.innerHTML = `<select id="profileId"><option value="1">All formats</option><option value="2">CSV only</option><option value="3">JSON only</option></select><div data-export-profile-formats><select id="fileType"><option value="excel">Excel</option><option value="csv" selected>CSV</option></select></div>`;
  const container = document.querySelector<HTMLElement>(
    "[data-export-profile-formats]",
  )!;
  container.dataset.exportProfileFormats = JSON.stringify({
    1: { excel: "Excel", csv: "CSV", json: "JSON", xml: "XML", text: "Text" },
    2: { csv: "CSV" },
    3: { json: "JSON" },
  });
  container.dataset.exportFormatPlaceholder = "Choose a file type";
  attachProfileFormats(container);
  const profile = document.querySelector<HTMLSelectElement>("#profileId")!;
  const fileType = document.querySelector<HTMLSelectElement>("#fileType")!;
  return {
    fileType,
    select(id: string) {
      profile.value = id;
      profile.dispatchEvent(new Event("change"));
    },
  };
}

it("preserves an allowed file type and only displays formats for the selected profile", () => {
  const f = mount();
  expect(f.fileType.value).toBe("csv");
  f.select("2");
  expect(f.fileType.value).toBe("csv");
  expect(Array.from(f.fileType.options).map((o) => o.value)).toEqual([
    "",
    "csv",
  ]);
});

it("requires a new choice when the previous file type is disallowed", () => {
  const f = mount();
  f.select("3");
  expect(f.fileType.value).toBe("");
  expect(f.fileType.selectedOptions[0].text).toBe("Choose a file type");
  expect(Array.from(f.fileType.options).map((o) => o.value)).toEqual([
    "",
    "json",
  ]);
});

it("restores all formats when returning to an unrestricted profile", () => {
  const f = mount();
  f.select("2");
  f.select("1");
  expect(Array.from(f.fileType.options).map((o) => o.value)).toEqual([
    "",
    "excel",
    "csv",
    "json",
    "xml",
    "text",
  ]);
  expect(f.fileType.value).toBe("csv");
});

it("does not offer formats when the selected profile is unavailable", () => {
  const f = mount();
  f.select("missing");
  expect(f.fileType.value).toBe("");
  expect(f.fileType.options).toHaveLength(1);
});
