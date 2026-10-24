import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import { beforeEach, describe, expect, it } from "vitest";
import { type FieldStore, fieldActions } from ".";
import reducer from "./index";

const testType: FieldType = {
  implements: [],
  visible: true,
  name: "Test",
  type: "test",
  typeClass: "test//test",
  properties: [],
};

/**
 * generates rows with fields in them based on the passed parameters
 * e.g. mockStoreGenerator(1, 2, 5) -> would yield 3 rows
 * row 1 - 1 field
 * row 2 - 2 fields
 * row 3 - 5 fields
 */
const mockStoreGenerator = (...fieldsInRow: number[]): FieldStore => {
  const store: FieldStore = [];
  let fieldIndex = 0;
  for (let rowIndex = 0; rowIndex < fieldsInRow.length; rowIndex++) {
    const fieldCount = fieldsInRow[rowIndex];
    for (let i = 0; i < fieldCount; i++) {
      store.push({
        uid: `field-${fieldIndex}`,
        rowUid: `row-${rowIndex}`,
        typeClass: "some//class",
        properties: {},
        order: i,
      });
      fieldIndex++;
    }
  }

  return store;
};

// Extracts [field, row, order] tuples from each field in the store
const narrowStore = (store: FieldStore): Array<[string, string, number]> =>
  store.map(({ uid, rowUid, order }) => [uid, rowUid, order]);

describe("fields reducer", () => {
  it("uses 10% on new layouts while preserving saved and favorite overlays", () => {
    const layoutType = {
      ...testType,
      typeClass: Fields.Layout,
      properties: [
        { handle: "overlayOpacity", value: 45, type: PropertyType.Integer },
        {
          handle: "overlayOpacityPreset",
          value: "custom",
          type: PropertyType.String,
        },
      ] as FieldType["properties"],
    };
    expect(
      reducer(
        [],
        fieldActions.add({ uid: "new", rowUid: "row", fieldType: layoutType }),
      )[0].properties,
    ).toMatchObject({ overlayOpacity: 10, overlayOpacityPreset: "light" });
    expect(
      reducer(
        [],
        fieldActions.add({
          uid: "favorite",
          rowUid: "row",
          fieldType: { ...layoutType, fromFavorite: true },
        }),
      )[0].properties,
    ).toMatchObject({ overlayOpacity: 45, overlayOpacityPreset: "custom" });
    expect(
      reducer(
        [],
        fieldActions.set([
          {
            uid: "old",
            typeClass: Fields.Layout,
            properties: { overlayOpacity: 0 },
          },
        ]),
      )[0].properties,
    ).toEqual({ overlayOpacity: 0 });
  });
  it("uses card dimension presets only for new layouts and preserves favorite and loaded values", () => {
    const layoutType = {
      ...testType,
      typeClass: Fields.Layout,
      properties: [
        { handle: "cardBorderWidth", value: 1, type: PropertyType.Integer },
        {
          handle: "cardBorderWidthPreset",
          value: "custom",
          type: PropertyType.String,
        },
        { handle: "cardRadius", value: 12, type: PropertyType.Integer },
        {
          handle: "cardRadiusPreset",
          value: "custom",
          type: PropertyType.String,
        },
      ] as FieldType["properties"],
    };
    expect(
      reducer(
        [],
        fieldActions.add({ uid: "new", rowUid: "row", fieldType: layoutType }),
      )[0].properties,
    ).toMatchObject({
      cardBorderWidthPreset: "one",
      cardRadiusPreset: "five",
      cardRadius: 5,
    });
    expect(
      reducer(
        [],
        fieldActions.add({
          uid: "favorite",
          rowUid: "row",
          fieldType: { ...layoutType, fromFavorite: true },
        }),
      )[0].properties,
    ).toMatchObject({
      cardBorderWidthPreset: "custom",
      cardRadiusPreset: "custom",
    });
    expect(
      reducer(
        [],
        fieldActions.set([
          {
            uid: "old",
            typeClass: Fields.Layout,
            properties: { cardBorderWidth: 0, cardRadius: 17 },
          },
        ]),
      )[0].properties,
    ).toEqual({ cardBorderWidth: 0, cardRadius: 17 });
  });
  it("starts new dividers at 1px and leaves saved custom thicknesses unchanged", () => {
    const fresh = reducer(
      [],
      fieldActions.add({
        uid: "divider",
        rowUid: "row",
        fieldType: { ...testType, typeClass: Fields.Divider },
      }),
    );
    expect(fresh[0].properties.thicknessPreset).toBe("one");
    const loaded = reducer(
      [],
      fieldActions.set([
        { uid: "old", typeClass: Fields.Divider, properties: { thickness: 4 } },
      ]),
    );
    expect(loaded[0].properties).toEqual({ thickness: 4 });
  });
  it("prefills new icon names, follows icon changes, and preserves custom descriptions and cleared decorative text", () => {
    const iconType: FieldType = {
      ...testType,
      typeClass: Fields.Icon,
      properties: [
        { handle: "icon", value: "star", type: PropertyType.String },
        { handle: "iconSize", value: 48, type: PropertyType.Integer },
        {
          handle: "iconSizePreset",
          value: "custom",
          type: PropertyType.String,
        },
        { handle: "accessibleText", value: "", type: PropertyType.String },
      ] as FieldType["properties"],
    };
    let state = reducer(
      [],
      fieldActions.add({ uid: "icon", rowUid: "row", fieldType: iconType }),
    );
    expect(state[0].properties).toMatchObject({
      accessibleText: "Star",
      iconSizePreset: "medium",
    });
    state = reducer(
      state,
      fieldActions.edit({ uid: "icon", handle: "icon", value: "arrow-left" }),
    );
    expect(state[0].properties.accessibleText).toBe("Arrow left");
    state = reducer(
      state,
      fieldActions.edit({
        uid: "icon",
        handle: "accessibleText",
        value: "Go back",
      }),
    );
    state = reducer(
      state,
      fieldActions.edit({ uid: "icon", handle: "icon", value: "chevron-left" }),
    );
    expect(state[0].properties.accessibleText).toBe("Go back");
    state = reducer(
      state,
      fieldActions.edit({ uid: "icon", handle: "accessibleText", value: "" }),
    );
    expect(state[0].properties.accessibleText).toBe("");
    const restored = reducer([], fieldActions.set(state));
    expect(restored[0].properties.accessibleText).toBe("");
    const legacy = reducer(
      [],
      fieldActions.set([
        {
          uid: "old",
          typeClass: Fields.Icon,
          properties: { icon: "star", iconSize: 91, accessibleText: "" },
        },
      ]),
    );
    expect(legacy[0].properties).toEqual({
      icon: "star",
      iconSize: 91,
      accessibleText: "",
    });
    const duplicated = reducer(
      legacy,
      fieldActions.duplicate({ uid: "copy", rowUid: "row", field: legacy[0] }),
    );
    expect(duplicated[1].properties).toMatchObject({
      iconSize: 91,
      accessibleText: "",
    });
  });
  describe("adding a field", () => {
    let mockStore: FieldStore;

    it("add field to new row", () => {
      mockStore = mockStoreGenerator(0);

      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.add({
            uid: "field-new",
            rowUid: "row-0",
            fieldType: testType,
          }),
        ),
      );

      expect(result).toEqual([["field-new", "row-0", 0]]);
    });

    it("add field to existing row", () => {
      mockStore = mockStoreGenerator(1);

      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.add({
            uid: "field-new",
            rowUid: "row-0",
            fieldType: testType,
          }),
        ),
      );

      expect(result).toEqual([
        ["field-0", "row-0", 0],
        ["field-new", "row-0", 1],
      ]);
    });

    it("add field to existing row in the middle", () => {
      mockStore = mockStoreGenerator(3);

      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.add({
            uid: "field-new",
            rowUid: "row-0",
            fieldType: testType,
            order: 1,
          }),
        ),
      );

      expect(result).toEqual([
        ["field-0", "row-0", 0],
        ["field-1", "row-0", 2],
        ["field-2", "row-0", 3],
        ["field-new", "row-0", 1],
      ]);
    });
  });

  describe("moving a field", () => {
    let mockStore: FieldStore;
    beforeEach(() => {
      mockStore = mockStoreGenerator(4, 3);
    });

    it("move field from 0 to 2 in same row", () => {
      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.moveTo({
            uid: "field-0",
            rowUid: "row-0",
            position: 2,
          }),
        ),
      );

      expect(result).toEqual([
        ["field-0", "row-0", 2],
        ["field-1", "row-0", 0],
        ["field-2", "row-0", 1],
        ["field-3", "row-0", 3],
        ["field-4", "row-1", 0],
        ["field-5", "row-1", 1],
        ["field-6", "row-1", 2],
      ]);
    });

    it("move field from 1 to 0 in same row", () => {
      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.moveTo({
            uid: "field-1",
            rowUid: "row-0",
            position: 0,
          }),
        ),
      );

      expect(result).toEqual([
        ["field-0", "row-0", 1],
        ["field-1", "row-0", 0],
        ["field-2", "row-0", 2],
        ["field-3", "row-0", 3],
        ["field-4", "row-1", 0],
        ["field-5", "row-1", 1],
        ["field-6", "row-1", 2],
      ]);
    });

    it("move field from row to other row", () => {
      const result = narrowStore(
        reducer(
          mockStore,
          fieldActions.moveTo({
            uid: "field-1",
            rowUid: "row-1",
            position: 1,
          }),
        ),
      );

      expect(result).toEqual([
        ["field-0", "row-0", 0],
        ["field-1", "row-1", 1],
        ["field-2", "row-0", 1],
        ["field-3", "row-0", 2],
        ["field-4", "row-1", 0],
        ["field-5", "row-1", 2],
        ["field-6", "row-1", 3],
      ]);
    });
  });
});

it("retains old radius preset dimensions as editable custom values when loading or inserting favorites", () => {
  for (const [cardRadiusPreset, cardRadius] of Object.entries({
    square: 0,
    small: 4,
    medium: 8,
    rounded: 12,
    large: 24,
  })) {
    const saved = [
      {
        uid: "legacy",
        typeClass: Fields.Layout,
        properties: { cardRadiusPreset, cardRadius: 17 },
      },
    ];
    const loaded = reducer([], fieldActions.set(saved));
    expect(loaded[0].properties).toMatchObject({
      cardRadiusPreset: "custom",
      cardRadius,
    });
    expect(saved[0].properties.cardRadius).toBe(17);
    const favorite = reducer(
      [],
      fieldActions.add({
        uid: "favorite",
        rowUid: "row",
        fieldType: {
          ...testType,
          typeClass: Fields.Layout,
          fromFavorite: true,
          properties: [
            {
              handle: "cardRadiusPreset",
              value: cardRadiusPreset,
              type: PropertyType.String,
            },
            { handle: "cardRadius", value: 17, type: PropertyType.Integer },
          ] as FieldType["properties"],
        },
      }),
    );
    expect(favorite[0].properties).toMatchObject({
      cardRadiusPreset: "custom",
      cardRadius,
    });
  }
});
