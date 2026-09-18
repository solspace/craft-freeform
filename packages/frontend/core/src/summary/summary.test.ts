import { describe, expect, it } from "vitest";
import type {
  FreeformManifest,
  ManifestFieldDefinition,
} from "../types/manifest.js";
import {
  formatSummaryValue,
  getSummaryEntries,
  supportsSummary,
} from "./summary.js";

const field = (handle: string, type = "text"): ManifestFieldDefinition => ({
  id: 1,
  uid: handle,
  handle,
  label: handle,
  type,
  required: false,
});
const config = {
  hideEmpty: true,
  checkedLabel: "Yes",
  uncheckedLabel: "No",
  filesLabel: "Files",
};

describe("summary values", () => {
  it("preserves zero and treats unchecked/empty answers as empty", () => {
    expect(formatSummaryValue({ type: "number" }, 0, config)).toBe("0");
    expect(formatSummaryValue({ type: "text" }, null, config)).toBe("");
    expect(formatSummaryValue({ type: "checkbox" }, false, config)).toBe("");
    expect(formatSummaryValue({ type: "checkbox" }, "0", config)).toBe("");
    expect(
      formatSummaryValue({ type: "checkbox" }, false, {
        ...config,
        hideEmpty: false,
      }),
    ).toBe("No");
    expect(formatSummaryValue({ type: "checkbox" }, "yes", config)).toBe("Yes");
  });

  it("uses choice labels, preserving selection order", () => {
    expect(
      formatSummaryValue(
        {
          type: "checkboxes",
          options: [
            { value: "a", label: "Apples" },
            { value: "b", label: "Bananas" },
          ],
        },
        ["b", "a"],
        config,
      ),
    ).toBe("Bananas, Apples");
  });

  it("counts uploads without displaying IDs or object internals", () => {
    expect(
      formatSummaryValue(
        { type: "file-dnd" },
        ["private-asset-1", "private-asset-2"],
        config,
      ),
    ).toBe("Files: 2");
    expect(
      formatSummaryValue({ type: "text" }, { secret: "private" }, config),
    ).toBe("");
  });

  it("formats table rows and file cells", () => {
    expect(
      formatSummaryValue(
        {
          type: "table",
          columns: [
            { type: "string", label: "Name" },
            { type: "number", label: "Count" },
            { type: "file", label: "Attachments" },
          ],
        },
        [
          ["A", 0, [123]],
          ["B", 2, []],
        ],
        config,
      ),
    ).toBe("Name: A; Count: 0; Attachments: Files: 1\nName: B; Count: 2");
  });

  it("excludes sensitive and unknown field types", () => {
    for (const type of [
      "hidden",
      "invisible",
      "password",
      "confirm",
      "signature",
      "summary",
      "html",
      "stripe",
      "cc-number",
      "custom-secret",
    ])
      expect(supportsSummary(type)).toBe(false);
  });
});

describe("headless summary", () => {
  it("preserves labels as text, including markup and literal angle brackets", () => {
    const labels = [
      "Age < 18 & score > 5",
      "<strong>Name</strong>",
      '<img src=x onerror="alert(1)">',
      "<scr<script>ipt>alert(1)</script>",
      "<script",
    ];
    const fields = Object.fromEntries(
      labels.map((label, index) => [
        String(index),
        { ...field(String(index)), label },
      ]),
    );
    const summary = {
      ...field("review", "summary"),
      frontend: { config: { fields: Object.keys(fields), hideEmpty: false } },
    };
    const entries = getSummaryEntries(summary, {
      manifest: { fields } as unknown as FreeformManifest,
      values: {},
      isFieldVisible: () => true,
    });
    expect(entries.map((entry) => entry.label)).toEqual(labels);
  });

  it("handles long malformed labels without regex backtracking", () => {
    const label = "<".repeat(100_000);
    const summary = {
      ...field("review", "summary"),
      frontend: { config: { fields: ["name"], hideEmpty: false } },
    };
    const start = performance.now();
    const entries = getSummaryEntries(summary, {
      manifest: {
        fields: { name: { ...field("name"), label } },
      } as unknown as FreeformManifest,
      values: {},
      isFieldVisible: () => true,
    });
    const elapsed = performance.now() - start;
    expect(entries[0].label).toBe(label);
    expect(elapsed).toBeLessThan(1000);
  });

  it("uses current values, explicit source order, option labels and empty settings", () => {
    const name = field("name");
    const interests = {
      ...field("interests", "cards"),
      frontend: { config: { cards: [{ value: "a", label: "Art" }] } },
    };
    const summary = {
      ...field("review", "summary"),
      frontend: {
        config: { fields: ["interests", "name", "missing"], hideEmpty: false },
      },
    };
    const form = {
      manifest: { fields: { name, interests } } as unknown as FreeformManifest,
      values: { name: "", interests: ["a"] },
      isFieldVisible: () => true,
    };
    expect(getSummaryEntries(summary, form).map((row) => row.text)).toEqual([
      "Art",
      "Not answered",
    ]);
    form.values.name = "Changed";
    expect(getSummaryEntries(summary, form)[1].text).toBe("Changed");
  });

  it("omits hidden fields, hidden ancestors, locked hidden context and hidden calculations", () => {
    const fields = {
      group: {
        ...field("group", "group"),
        layout: { rows: [{ uid: "row", fields: ["nested"] }] },
      },
      nested: field("nested"),
      hidden: field("hidden"),
      contextHidden: field("contextHidden"),
      password: field("password", "password"),
      calculation: {
        ...field("calculation", "calculation"),
        frontend: { config: { inputType: "hidden" } },
      },
    };
    const summary = {
      ...field("review", "summary"),
      frontend: { config: { fields: Object.keys(fields) } },
    };
    const form = {
      manifest: {
        fields,
        context: { hiddenFields: ["contextHidden"] },
      } as unknown as FreeformManifest,
      values: Object.fromEntries(
        Object.keys(fields).map((key) => [key, "secret"]),
      ),
      isFieldVisible: (handle: string) => !["hidden", "group"].includes(handle),
    };
    expect(getSummaryEntries(summary, form)).toEqual([]);
  });
});
