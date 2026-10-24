import {
  availableComponents,
  componentFieldType,
  componentNodes,
  getComponentPresets,
} from "@editor/builder/tabs/layout/field-list/catalog/components/component.presets";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { reducer } from "../..";
import { historyActions } from "../../history";
import { createHistoryMiddleware } from "../../middleware/history";
import { contextActions } from "../../slices/context";
import { fieldActions } from "../../slices/layout/fields";
import { layoutActions } from "../../slices/layout/layouts";
import { pageActions } from "../../slices/layout/pages";
import { rowActions } from "../../slices/layout/rows";
import { fieldThunks } from "../fields";

const types: FieldType[] = [
  Fields.Group,
  Fields.Layout,
  Fields.Heading,
  Fields.RichText,
  Fields.Divider,
  Fields.Image,
  Fields.ButtonLink,
  Fields.Icon,
].map(
  (typeClass): FieldType => ({
    typeClass,
    name: typeClass.split("\\").at(-1)!,
    type: typeClass === Fields.Layout ? "layout" : "field",
    visible: true,
    implements: [],
    properties: [],
  }),
);
const createStore = () => {
  const store = configureStore({
    reducer,
    middleware: (defaults) => defaults().concat(createHistoryMiddleware()),
  });
  store.dispatch(layoutActions.set([{ uid: "page-layout" }]));
  store.dispatch(
    pageActions.set([
      { uid: "page", layoutUid: "page-layout", label: "Page", order: 0 },
    ]),
  );
  store.dispatch(contextActions.setPage("page"));
  return store;
};
const preset = (id: string, variant = 0) => {
  const definition = getComponentPresets().find((preset) => preset.id === id)!;
  return componentFieldType(definition, definition.variants[variant], types);
};

describe("component sections", () => {
  it.each(
    getComponentPresets().flatMap((preset) =>
      preset.variants.map(
        (variant) =>
          [
            preset.name,
            variant.label,
            componentFieldType(preset, variant, types),
          ] as const,
      ),
    ),
  )(
    "inserts %s / %s as an editable, connected section with one Undo/Redo step",
    async (_name, _variant, type) => {
      const store = createStore();
      const before = store.getState().layout;
      store.dispatch(fieldThunks.move.newField.newRow({ fieldType: type }));
      const inserted = store.getState().layout;
      expect(inserted.fields.length).toBeGreaterThan(2);
      expect(
        inserted.fields.every((field) =>
          inserted.rows.some((row) => row.uid === field.rowUid),
        ),
      ).toBe(true);
      expect(
        inserted.rows.every((row) =>
          inserted.layouts.some((layout) => layout.uid === row.layoutUid),
        ),
      ).toBe(true);
      expect(
        new Set(inserted.fields.map((field) => field.properties.handle)).size,
      ).toBe(inserted.fields.length);
      expect(JSON.stringify(inserted)).not.toContain('"component":');
      const content = inserted.fields.filter((field) =>
        [Fields.Heading, Fields.RichText].includes(field.typeClass as Fields),
      );
      expect(content.every((field) => !!field.properties.content)).toBe(true);
      expect(
        content.length +
          inserted.fields.filter((field) => field.typeClass === Fields.Image)
            .length,
      ).toBeGreaterThan(0);
      await Promise.resolve();
      store.dispatch(historyActions.undo());
      expect(store.getState().layout).toEqual(before);
      store.dispatch(historyActions.redo());
      expect(store.getState().layout).toEqual(inserted);
      const root = inserted.fields.find(
        (field) =>
          inserted.rows.find((row) => row.uid === field.rowUid)?.layoutUid ===
          "page-layout",
      )!;
      store.dispatch(fieldThunks.remove(root));
      expect(store.getState().layout).toEqual(before);
    },
  );
  it("creates independent sections and keeps edited content when duplicating", () => {
    const store = createStore();
    store.dispatch(
      fieldThunks.move.newField.newRow({ fieldType: preset("cards") }),
    );
    store.dispatch(
      fieldThunks.move.newField.newRow({ fieldType: preset("cards") }),
    );
    const state = store.getState().layout;
    expect(new Set(state.fields.map((field) => field.uid)).size).toBe(
      state.fields.length,
    );
    expect(
      new Set(state.fields.map((field) => field.properties.handle)).size,
    ).toBe(state.fields.length);
    const root = state.fields.find(
      (field) => field.typeClass === Fields.Layout,
    )!;
    const heading = state.fields.find(
      (field) => field.typeClass === Fields.Heading,
    )!;
    store.dispatch(
      fieldActions.edit({
        uid: heading.uid,
        handle: "content",
        value: "My edited heading",
      }),
    );
    store.dispatch(
      fieldThunks.duplicate(
        root,
        state.rows.find((row) => row.uid === root.rowUid)!,
      ),
    );
    const copies = store
      .getState()
      .layout.fields.filter(
        (field) => !state.fields.some((original) => original.uid === field.uid),
      );
    expect(
      copies.some((field) => field.properties.content === "My edited heading"),
    ).toBe(true);
    expect(
      copies
        .filter((field) => field.properties.layout)
        .every(
          (field) =>
            !state.layouts.some(
              (layout) => layout.uid === field.properties.layout,
            ),
        ),
    ).toBe(true);
  });
  it("supports inserting beside another field without changing the existing field", () => {
    const store = createStore();
    store.dispatch(rowActions.add({ uid: "row", layoutUid: "page-layout" }));
    const row = store.getState().layout.rows[0];
    store.dispatch(
      fieldThunks.move.newField.existingRow({
        row,
        order: 0,
        fieldType: preset("text"),
      }),
    );
    const original = store.getState().layout.fields[0];
    store.dispatch(
      fieldThunks.move.newField.existingRow({
        row,
        order: 1,
        fieldType: preset("intro"),
      }),
    );
    expect(
      store
        .getState()
        .layout.fields.find((field) => field.uid === original.uid),
    ).toEqual(original);
    expect(
      store
        .getState()
        .layout.fields.filter((field) => field.rowUid === row.uid),
    ).toHaveLength(2);
  });
  it("offers styled cards from two through six and defaults Hero to a background image", () => {
    const components = getComponentPresets();
    expect(components.find((item) => item.id === "hero")?.variants[0].id).toBe(
      "background",
    );
    const cards = components.find((item) => item.id === "cards")!;
    expect(
      cards.variants.map((variant) => variant.root.columns?.length).sort(),
    ).toEqual([2, 3, 4, 5, 6]);
    expect(
      cards.variants.every(
        (variant) => variant.root.properties?.columnStyle === "cards",
      ),
    ).toBe(true);
  });
  it("rejects unavailable types before creating any rows or fields", () => {
    const store = createStore();
    const type = preset("hero");
    type.component.types = types.filter(
      (type) => type.typeClass !== Fields.RichText,
    );
    const before = store.getState().layout;
    store.dispatch(fieldThunks.move.newField.newRow({ fieldType: type }));
    expect(store.getState().layout).toEqual(before);
  });
  it("offers all eight new components with editable links, lists, and optional image captions", () => {
    const components = getComponentPresets();
    expect(components.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "cta",
        "faq",
        "testimonials",
        "steps",
        "features",
        "statistics",
        "gallery",
        "pricing",
      ]),
    );
    for (const id of ["cta", "pricing"]) {
      for (const variant of components.find((item) => item.id === id)!
        .variants) {
        const links = componentNodes(variant.root).filter(
          (node) => node.typeClass === Fields.ButtonLink,
        );
        expect(links.length).toBeGreaterThan(0);
        expect(
          links.every(
            (node) =>
              !!node.properties?.linkText &&
              node.properties.alignment === "center",
          ),
        ).toBe(true);
        expect(JSON.stringify(variant)).not.toContain("<button");
      }
    }
    const pricing = componentNodes(
      components.find((item) => item.id === "pricing")!.variants[0].root,
    );
    expect(
      pricing.filter((node) =>
        String(node.properties?.content ?? "").includes("<ul>"),
      ).length,
    ).toBe(3);
    const gallery = components.find((item) => item.id === "gallery")!;
    expect(
      componentNodes(gallery.variants.at(-1)!.root).filter(
        (node) => node.typeClass === Fields.RichText,
      ),
    ).toHaveLength(0);
    expect(
      gallery.variants.every(
        (variant) => variant.root.properties?.mobile === "stack",
      ),
    ).toBe(true);
  });
  it("keeps handles unique across every new component and a duplicated gallery", () => {
    const store = createStore();
    for (const id of [
      "cta",
      "faq",
      "testimonials",
      "steps",
      "features",
      "statistics",
      "gallery",
      "pricing",
    ]) {
      store.dispatch(
        fieldThunks.move.newField.newRow({ fieldType: preset(id) }),
      );
    }
    const before = store.getState().layout;
    const gallery = before.fields.find(
      (field) => field.properties.label === "Image gallery",
    )!;
    store.dispatch(
      fieldThunks.duplicate(
        gallery,
        before.rows.find((row) => row.uid === gallery.rowUid)!,
      ),
    );
    const fields = store.getState().layout.fields;
    expect(
      new Set(fields.map((field) => field.properties.handle.toLowerCase()))
        .size,
    ).toBe(fields.length);
    const originalImage = before.fields.find(
      (field) => field.properties.label === "Gallery image 1",
    )!;
    store.dispatch(
      fieldActions.edit({
        uid: originalImage.uid,
        handle: "assetId",
        value: [42],
      }),
    );
    const copy = store
      .getState()
      .layout.fields.find(
        (field) =>
          field.properties.label === "Gallery image 1" &&
          field.uid !== originalImage.uid,
      )!;
    expect(copy.properties.assetId).not.toEqual([42]);
  });
  it("filters presets and individual arrangements by permissions and hidden fields", () => {
    expect(
      availableComponents(
        types.filter((type) =>
          [Fields.Heading, Fields.Divider].includes(type.typeClass as Fields),
        ),
        [],
      ),
    ).toEqual([]);
    const withoutImages = availableComponents(types, [Fields.Image]);
    expect(
      withoutImages.find((preset) => preset.id === "gallery"),
    ).toBeUndefined();
    expect(
      withoutImages
        .find((preset) => preset.id === "hero")
        ?.variants.map((variant) => variant.id),
    ).toEqual(["background", "text"]);
    expect(
      withoutImages.find((preset) => preset.id === "image-text"),
    ).toBeUndefined();
    const withoutHeadings = availableComponents(
      types.map((type) => ({
        ...type,
        visible: type.typeClass !== Fields.Heading,
      })),
      [],
    );
    expect(withoutHeadings.map((preset) => preset.id)).toEqual(["gallery"]);
    expect(withoutHeadings[0].variants.map((variant) => variant.id)).toEqual([
      "three",
      "four",
      "images",
    ]);
  });
});
