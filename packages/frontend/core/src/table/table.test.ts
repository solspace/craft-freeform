import { describe, expect, it } from "vitest";
import type { ManifestFieldDefinition } from "../types/manifest.js";
import {
  canAddTableRow,
  canRemoveTableRow,
  normalizeTableRows,
  resolveInitialRowCount,
  type TableColumn,
  type TableConfig,
  validateTableValue,
} from "./table.js";

const columns: TableColumn[] = [
  { label: "Name", type: "text", required: true },
  { label: "Role", type: "select", options: ["A", "B"] },
  { label: "OK", type: "checkbox", checked: true },
];

function field(config: TableConfig): ManifestFieldDefinition {
  return {
    id: 1,
    uid: "table-uid",
    handle: "guests",
    type: "table",
    label: "Guests",
    required: false,
    frontend: {
      renderer: "table",
      extension: "table",
      config,
    },
  };
}

describe("resolveInitialRowCount", () => {
  it("uses exact rows", () => {
    expect(resolveInitialRowCount({ limitRows: "exact", exactRows: 3 })).toBe(
      3,
    );
  });

  it("uses min rows", () => {
    expect(resolveInitialRowCount({ limitRows: "min", minRows: 2 })).toBe(2);
  });
});

describe("normalizeTableRows", () => {
  it("pads to min rows", () => {
    const rows = normalizeTableRows([["Ada"]], columns, {
      limitRows: "min",
      minRows: 2,
    });
    expect(rows).toHaveLength(2);
    expect(rows[0][0]).toBe("Ada");
    expect(rows[0][2]).toBe("1");
  });

  it("clips exact rows", () => {
    const rows = normalizeTableRows(
      [
        ["a", "A", ""],
        ["b", "B", ""],
        ["c", "A", ""],
      ],
      columns,
      { limitRows: "exact", exactRows: 2 },
    );
    expect(rows).toHaveLength(2);
  });
});

describe("canAddTableRow / canRemoveTableRow", () => {
  it("blocks add/remove for exact", () => {
    const rows = [
      ["a", "A", ""],
      ["b", "B", ""],
    ];
    const config = { limitRows: "exact", exactRows: 2 };
    expect(canAddTableRow(rows, config)).toBe(false);
    expect(canRemoveTableRow(rows, 0, config)).toBe(false);
  });

  it("respects min row remove threshold", () => {
    const rows = [
      ["a", "A", ""],
      ["b", "B", ""],
      ["c", "A", ""],
    ];
    const config = { limitRows: "min", minRows: 2 };
    expect(canRemoveTableRow(rows, 0, config)).toBe(false);
    expect(canRemoveTableRow(rows, 2, config)).toBe(true);
  });
});

describe("validateTableValue", () => {
  it("reports required column issues", () => {
    const issues = validateTableValue(
      field({ columns, limitRows: "min", minRows: 1 }),
      [["", "A", "1"]],
    );
    expect(issues[0]?.columnLabel).toBe("Name");
  });

  it("reports required on padded min rows", () => {
    const issues = validateTableValue(
      field({ columns, limitRows: "min", minRows: 2 }),
      [["Ada", "A", "1"]],
    );
    expect(issues.some((issue) => issue.columnLabel === "Name")).toBe(true);
  });
});
