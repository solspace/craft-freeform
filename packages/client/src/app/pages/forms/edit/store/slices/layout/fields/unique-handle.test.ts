import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import { expect, it } from "vitest";
import reducer, { type FieldStore, fieldActions } from ".";

const type: FieldType = {
  name: "Column",
  type: "layout-column",
  typeClass: "column",
  visible: false,
  implements: [],
  properties: [],
};
const existing = (uid: string, handle: string, typeClass = "column") => ({
  uid,
  rowUid: "another-page",
  typeClass,
  properties: { handle, label: "Column" },
  order: 0,
});

it("avoids count-based collisions after columns are removed, including fields on other pages", () => {
  const state = [existing("one", "column"), existing("three", "column2")];
  const result = reducer(
    state,
    fieldActions.add({ uid: "new", rowUid: "nested", fieldType: type }),
  );
  expect(result.at(-1)?.properties.handle).toBe("column2_1");
  expect(result.slice(0, 2)).toEqual(state);
});
it("allocates unique handles for favorites with prefilled labels and handles", () => {
  const fieldType = {
    ...type,
    properties: [
      { handle: "label", value: "Hero", type: PropertyType.String },
      { handle: "handle", value: "hero", type: PropertyType.String },
    ],
  } as FieldType;
  const result = reducer(
    [existing("old", "Hero", "other")],
    fieldActions.add({ uid: "new", rowUid: "nested", fieldType }),
  );
  expect(result.at(-1)?.properties.handle).toBe("hero_1");
});
it("duplicates nested fields without a suffix limit or case-sensitive collisions", () => {
  const field = existing("original", "hero");
  const state: FieldStore = [
    field,
    ...Array.from({ length: 501 }, (_, index) =>
      existing(`other-${index}`, `HERO_${index + 1}`),
    ),
  ];
  const result = reducer(
    state,
    fieldActions.duplicate({ uid: "clone", rowUid: "nested", field }),
  );
  expect(result.at(-1)?.properties.handle).toBe("hero_502");
});
