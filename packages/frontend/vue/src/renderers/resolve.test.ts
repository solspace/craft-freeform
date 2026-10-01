import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import { describe, expect, it } from "vitest";
import {
  EmailFieldRenderer,
  SummaryFieldRenderer,
  UnsupportedFieldRenderer,
} from "./builtin/fields.js";
import { resolveFieldRenderer } from "./resolve.js";

const field: ManifestFieldDefinition = {
  id: 1,
  uid: "uid-1",
  handle: "email",
  type: "email",
  label: "Email",
  required: true,
  frontend: { renderer: "email", extension: null },
};

describe("resolveFieldRenderer", () => {
  it("resolves built-in type renderer", () => {
    const renderer = resolveFieldRenderer(field);
    expect(renderer).toBe(EmailFieldRenderer);
  });

  it("resolves Summary without an extension", () => {
    expect(
      resolveFieldRenderer({
        ...field,
        type: "summary",
        frontend: { renderer: "summary" },
      }),
    ).toBe(SummaryFieldRenderer);
  });

  it("prefers user handle override", () => {
    const Custom = () => null;
    const renderer = resolveFieldRenderer(field, {
      handles: { email: Custom },
    });
    expect(renderer).toBe(Custom);
  });

  it("falls back to unsupported renderer", () => {
    const renderer = resolveFieldRenderer({
      ...field,
      type: "exotic-field",
      frontend: { renderer: "exotic", extension: null },
    });
    expect(renderer).toBe(UnsupportedFieldRenderer);
  });
});
