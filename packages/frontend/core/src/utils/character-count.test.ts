import { describe, expect, it } from "vitest";
import type { ManifestFieldDefinition } from "../types/manifest.js";
import { getCharacterCount } from "./character-count.js";

const field: ManifestFieldDefinition = {
  id: 1,
  uid: "u",
  handle: "message",
  type: "textarea",
  label: "Message",
  required: false,
  frontend: { config: { showCharacterCount: true } },
  validation: { maxLength: 5 },
};
describe("character counts", () => {
  it.each([
    ["", 0],
    ["é", 1],
    ["😀", 2],
    ["a\r\nb", 3],
    ["a\rb", 3],
    ["e\u0301", 2],
  ])("matches maxlength for %j", (value, count) => {
    expect(getCharacterCount(field, value)?.count).toBe(count);
  });
  it("supports optional limits and translated messages", () => {
    expect(getCharacterCount(field, "hello")?.text).toBe("5 / 5 characters");
    expect(getCharacterCount(field, "longer")?.overLimit).toBe(true);
    expect(
      getCharacterCount(
        {
          ...field,
          validation: {},
          frontend: {
            config: {
              showCharacterCount: true,
              characterCountMessages: { count: "{count} Zeichen" },
            },
          },
        },
        "é",
      )?.text,
    ).toBe("1 Zeichen");
  });
  it("is disabled by default and only applies to text fields", () => {
    expect(
      getCharacterCount({ ...field, frontend: undefined }, "hi"),
    ).toBeUndefined();
    expect(
      getCharacterCount({ ...field, type: "password" }, "hi"),
    ).toBeUndefined();
  });
});
