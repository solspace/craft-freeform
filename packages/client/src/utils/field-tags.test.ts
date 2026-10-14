import { describe, expect, it } from "vitest";
import { generateValue as aiValue } from "../app/components/form-controls/control-types/ai-box/field-selection.hooks";
import { generateValue as calculationValue } from "../app/components/form-controls/control-types/calculation-box/calculation-box.hooks";
import { serializeFieldTags } from "./field-tags";

const chip = (handle: string): string =>
  `[[${JSON.stringify({ value: handle })}]]`;

const serialize = serializeFieldTags;

describe("mixed field tags", () => {
  it("keeps adjacent chips separate without user-entered spaces", () => {
    const value = serialize(
      chip("message") + chip("firstName") + chip("emailAddress"),
    );
    expect(value).toBe("field:message field:firstName field:emailAddress");
    expect(aiValue(value)).toBe("[[message]] [[firstName]] [[emailAddress]]");
    expect(calculationValue(value)).toBe(
      "[[message]] [[firstName]] [[emailAddress]]",
    );
  });

  it("retains ordering and duplicates when inserting between existing chips", () => {
    expect(
      serialize(chip("firstName") + chip("emailAddress") + chip("firstName")),
    ).toBe("field:firstName field:emailAddress field:firstName");
  });

  it("retains whitespace-separated chips without adding redundant spaces", () => {
    expect(serialize(`${chip("message")} ${chip("emailAddress")}`)).toBe(
      "field:message field:emailAddress",
    );
  });

  it("normalizes pasted whitespace, line breaks, and caret placeholders", () => {
    expect(
      serialize(
        `\u200B${chip("firstName")}\u200B\r\n${chip("emailAddress")}\r\n${chip("message")}\u00A0\u00A0`,
      ),
    ).toBe("field:firstName field:emailAddress field:message");
  });

  it("preserves calculation operators, parentheses, decimals, and literal text", () => {
    const value = serialize(
      `round((${chip("price")}*${chip("quantity")})+1.25,2)`,
    );
    expect(value).toBe("round((field:price*field:quantity)+1.25,2)");
    expect(calculationValue(value)).toBe(
      "round(([[price]]*[[quantity]])+1.25,2)",
    );
  });

  it("separates words from chip boundaries without changing punctuation", () => {
    expect(
      serialize(`before${chip("firstName")}after,${chip("emailAddress")}.`),
    ).toBe("before field:firstName after,field:emailAddress.");
  });

  it("uses each chip value without including additional tag metadata", () => {
    expect(
      serialize('[[{"value":"field_2","title":"Field 2","prefix":"@"}]]'),
    ).toBe("field:field_2");
    expect(aiValue(serialize(chip("field_2")), "<mark>...</mark>")).toBe(
      "<mark>field_2</mark>",
    );
  });

  it("saves an empty selection after all chips are deleted", () => {
    expect(serialize("\u200B\r\n\u00A0")).toBe("");
  });
  it("preserves literal brackets and malformed token-shaped text", () => {
    expect(serialize('[[literal]] [[{broken}]] [[{"other":"text"}]]')).toBe(
      '[[literal]] [[{broken}]] [[{"other":"text"}]]',
    );
  });
});
