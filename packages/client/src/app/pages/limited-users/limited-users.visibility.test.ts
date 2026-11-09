import { describe, expect, it } from "vitest";
import type { Item } from "./limited-users.types";
import { getHiddenPropertyGroups } from "./limited-users.visibility";

const itemsFor = (types: string[]): Item[] => [
  {
    id: "layout",
    name: "Layout",
    type: "group",
    children: [
      {
        id: "fieldTypes",
        name: "Allowed Field Types",
        type: "toggles",
        values: types.map(
          (type) => `Solspace\\Freeform\\Fields\\Implementations\\${type}`,
        ),
        options: [],
      },
    ],
  },
];

describe("field-specific property visibility", () => {
  it.each([
    ["date", "Pro\\DatetimeField"],
    ["phone", "Pro\\PhoneField"],
    ["html", "HtmlField"],
    ["table", "Pro\\TableField"],
    ["rating", "Pro\\RatingField"],
    ["signature", "Pro\\SignatureField"],
    ["calculation", "Pro\\CalculationField"],
    ["cards", "Pro\\CardsField"],
    ["image", "Pro\\ImageField"],
  ])(
    "shows %s only while its corresponding field type is enabled",
    (group, type) => {
      expect(getHiddenPropertyGroups(itemsFor([type])).has(group)).toBe(false);
      expect(getHiddenPropertyGroups(itemsFor([])).has(group)).toBe(true);
    },
  );

  it.each([
    ["FileUploadField"],
    ["Pro\\FileDragAndDropField"],
    ["FileUploadField", "Pro\\FileDragAndDropField"],
  ])(
    "keeps file settings visible when either upload type is allowed (%s)",
    (...types) => {
      expect(getHiddenPropertyGroups(itemsFor(types)).has("file")).toBe(false);
    },
  );

  it("hides file settings only when both upload types are disabled", () => {
    expect(getHiddenPropertyGroups(itemsFor([])).has("file")).toBe(true);
  });

  it("does not modify permissions and leaves unknown groups and missing field-type metadata visible", () => {
    const items = itemsFor([]);
    const before = structuredClone(items);
    expect(getHiddenPropertyGroups(items).has("custom-property-group")).toBe(
      false,
    );
    expect(items).toEqual(before);
    expect(getHiddenPropertyGroups([]).size).toBe(0);
  });
});
