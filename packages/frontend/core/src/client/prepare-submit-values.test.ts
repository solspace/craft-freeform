import { describe, expect, it } from "vitest";
import type { ManifestFieldDefinition } from "../types/manifest.js";
import {
  prepareSubmitValues,
  tableCellFileKey,
} from "./prepare-submit-values.js";

describe("prepareSubmitValues", () => {
  it("completes website values submitted without a blur, leaving text values and source state unchanged", () => {
    const field = {
      handle: "website",
      type: "website",
    } as ManifestFieldDefinition;
    const raw = {
      website: " example.com/Contact?ref=AbC#Team ",
      notes: "example.com",
    };
    expect(prepareSubmitValues(raw, { website: field }).values).toEqual({
      website: "https://example.com/Contact?ref=AbC#Team",
      notes: "example.com",
    });
    expect(raw.website).toBe(" example.com/Contact?ref=AbC#Team ");
  });

  it("extracts top-level files", () => {
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });
    const result = prepareSubmitValues({ name: "Ada", resume: file });
    expect(result.values).toEqual({ name: "Ada" });
    expect(result.files.resume).toBe(file);
  });

  it("extracts nested table cell files", () => {
    const file = new File(["x"], "pass.pdf", { type: "application/pdf" });
    const field = {
      id: 1,
      uid: "t",
      handle: "guests",
      type: "table",
      label: "Guests",
      required: false,
      frontend: { renderer: "table", extension: "table", config: {} },
    } as ManifestFieldDefinition;

    const result = prepareSubmitValues(
      {
        guests: [
          ["Ada", "A", [file]],
          ["Bob", "B", []],
        ],
      },
      { guests: field },
    );

    expect(result.values.guests).toEqual([
      ["Ada", "A", []],
      ["Bob", "B", []],
    ]);
    expect(result.files[tableCellFileKey("guests", 0, 2)]).toEqual([file]);
  });
});
