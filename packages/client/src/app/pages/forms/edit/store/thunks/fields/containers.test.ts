import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { reducer } from "../..";
import { historyActions } from "../../history";
import { createHistoryMiddleware } from "../../middleware/history";
import { contextActions } from "../../slices/context";
import { fieldActions } from "../../slices/layout/fields";
import { layoutActions } from "../../slices/layout/layouts";
import { pageActions } from "../../slices/layout/pages";
import { fieldThunks } from "../fields";
import { canPlaceField, changeLayoutPreset } from "./containers";

const type = (
  typeClass: string,
  name: string,
  defaults: Record<string, string> = {},
): FieldType => ({
  typeClass,
  type: name.toLowerCase(),
  name,
  visible: true,
  implements: [],
  properties: Object.entries(defaults).map(([handle, value]) => ({
    handle,
    value,
    type: PropertyType.String,
    label: handle,
    visible: true,
  })),
});
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
const layoutType = type(Fields.Layout, "Layout", {
  preset: "three",
  gap: "medium",
  mobile: "stack",
});
const addLayout = (store: ReturnType<typeof createStore>) => {
  store.dispatch(fieldThunks.move.newField.newRow({ fieldType: layoutType }));
  return store
    .getState()
    .layout.fields.find((field) => field.typeClass === Fields.Layout)!;
};
const settle = async () => {
  await Promise.resolve();
};

describe("layout containers", () => {
  it("keeps all handles unique while shrinking, regrowing, and adding layouts", () => {
    const store = createStore();
    const first = addLayout(store);
    addLayout(store);
    store.dispatch(changeLayoutPreset(first.uid, "one"));
    store.dispatch(changeLayoutPreset(first.uid, "six"));
    addLayout(store);
    const handles = store
      .getState()
      .layout.fields.map((field) =>
        String(field.properties.handle).toLowerCase(),
      );
    expect(new Set(handles).size).toBe(handles.length);
  });
  it("creates independent column stacks and restores the entire layout with Undo/Redo", async () => {
    const store = createStore();
    addLayout(store);
    expect(
      store
        .getState()
        .layout.fields.filter(
          (field) => field.typeClass === Fields.LayoutColumn,
        ),
    ).toHaveLength(3);
    expect(
      new Set(
        store.getState().layout.fields.map((field) => field.properties.layout),
      ).size,
    ).toBe(4);
    await settle();
    store.dispatch(historyActions.undo());
    expect(store.getState().layout.fields).toHaveLength(0);
    expect(store.getState().layout.layouts).toEqual([{ uid: "page-layout" }]);
    store.dispatch(historyActions.redo());
    expect(store.getState().layout.fields).toHaveLength(4);
  });
  it("keeps child values, identity, and ordering when reducing and expanding columns", () => {
    const store = createStore();
    const layout = addLayout(store);
    const columns = store
      .getState()
      .layout.fields.filter((field) => field.typeClass === Fields.LayoutColumn);
    for (let index = 1; index < 3; index++) {
      store.dispatch(
        fieldThunks.move.newField.newRow({
          fieldType: type(Fields.Text, "Text"),
          layoutUid: String(columns[index].properties.layout),
        }),
      );
      const child = store
        .getState()
        .layout.fields.filter((field) => field.typeClass === Fields.Text)
        .at(-1)!;
      store.dispatch(
        fieldActions.edit({
          uid: child.uid,
          handle: "defaultValue",
          value: index === 1 ? "" : "Saved value",
        }),
      );
    }
    const original = store
      .getState()
      .layout.fields.filter((field) => field.typeClass === Fields.Text);
    store.dispatch(changeLayoutPreset(layout.uid, "two"));
    expect(
      store
        .getState()
        .layout.fields.filter(
          (field) => field.typeClass === Fields.LayoutColumn,
        ),
    ).toHaveLength(2);
    expect(
      store
        .getState()
        .layout.fields.filter((field) => field.typeClass === Fields.Text),
    ).toEqual(original);
    for (const preset of ["three-one", "one-three"]) {
      store.dispatch(changeLayoutPreset(layout.uid, preset));
      expect(
        store
          .getState()
          .layout.fields.filter(
            (field) => field.typeClass === Fields.LayoutColumn,
          ),
      ).toHaveLength(2);
      expect(
        store
          .getState()
          .layout.fields.filter((field) => field.typeClass === Fields.Text),
      ).toEqual(original);
      expect(
        store.getState().layout.fields.find((field) => field.uid === layout.uid)
          ?.properties.preset,
      ).toBe(preset);
    }
    const rows = store
      .getState()
      .layout.rows.filter(
        (row) => row.layoutUid === columns[1].properties.layout,
      );
    expect(rows.map((row) => row.order)).toEqual([0, 1]);
    store.dispatch(changeLayoutPreset(layout.uid, "three"));
    expect(
      store
        .getState()
        .layout.fields.filter(
          (field) => field.typeClass === Fields.LayoutColumn,
        ),
    ).toHaveLength(3);
    expect(
      store
        .getState()
        .layout.fields.filter((field) => field.typeClass === Fields.Text),
    ).toEqual(original);
  });
  it("duplicates all nested layouts independently and removes them without orphaning rows or fields", () => {
    const store = createStore();
    const layout = addLayout(store);
    const column = store
      .getState()
      .layout.fields.find((field) => field.typeClass === Fields.LayoutColumn)!;
    store.dispatch(
      fieldThunks.move.newField.newRow({
        fieldType: type(Fields.Group, "Group"),
        layoutUid: String(column.properties.layout),
      }),
    );
    const group = store
      .getState()
      .layout.fields.find((field) => field.typeClass === Fields.Group)!;
    store.dispatch(
      fieldThunks.move.newField.newRow({
        fieldType: type(Fields.Email, "Email"),
        layoutUid: String(group.properties.layout),
      }),
    );
    const original = store.getState().layout;
    const row = original.rows.find((row) => row.uid === layout.rowUid)!;
    store.dispatch(fieldThunks.duplicate(layout, row));
    const duplicates = store
      .getState()
      .layout.fields.filter(
        (field) => !original.fields.some((item) => item.uid === field.uid),
      );
    expect(duplicates).toHaveLength(original.fields.length);
    for (const copy of duplicates.filter((field) => field.properties.layout))
      expect(
        original.layouts.some(
          (layout) => layout.uid === copy.properties.layout,
        ),
      ).toBe(false);
    const copy = duplicates.find((field) => field.typeClass === Fields.Layout)!;
    store.dispatch(fieldThunks.remove(copy));
    expect(store.getState().layout).toEqual(original);
    store.dispatch(fieldThunks.remove(layout));
    expect(store.getState().layout.fields).toHaveLength(0);
    expect(store.getState().layout.rows).toHaveLength(0);
    expect(store.getState().layout.layouts).toEqual([{ uid: "page-layout" }]);
  });
  it("prevents dropping containers into their descendants and nesting column layouts", () => {
    const store = createStore();
    const layout = addLayout(store);
    const column = store
      .getState()
      .layout.fields.find((field) => field.typeClass === Fields.LayoutColumn)!;
    expect(
      canPlaceField(store.getState(), layout, String(column.properties.layout)),
    ).toBe(false);
    const before = store.getState().layout;
    store.dispatch(
      fieldThunks.move.existingField.newRow({
        field: layout,
        layoutUid: String(column.properties.layout),
      }),
    );
    store.dispatch(
      fieldThunks.move.newField.newRow({
        fieldType: layoutType,
        layoutUid: String(column.properties.layout),
      }),
    );
    expect(store.getState().layout).toEqual(before);
  });
});
