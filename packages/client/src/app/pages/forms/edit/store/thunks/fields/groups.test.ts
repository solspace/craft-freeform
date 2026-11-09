import { Fields } from "@ff-client/types/field.classes";
import { configureStore } from "@reduxjs/toolkit";
import { expect, it } from "vitest";
import { reducer } from "../..";
import { fieldActions } from "../../slices/layout/fields";
import { layoutActions } from "../../slices/layout/layouts";
import { rowActions } from "../../slices/layout/rows";
import duplicate from "./duplicate";
import remove from "./remove";

it("duplicates nested Groups independently and removes only the copied tree", () => {
  const store = configureStore({ reducer });
  store.dispatch(
    layoutActions.set([
      { uid: "root" },
      { uid: "outer-layout" },
      { uid: "inner-layout" },
    ]),
  );
  const rows = [
    { uid: "root-row", layoutUid: "root", order: 0 },
    { uid: "outer-row", layoutUid: "outer-layout", order: 0 },
    { uid: "inner-row", layoutUid: "inner-layout", order: 0 },
  ];
  store.dispatch(rowActions.set(rows));
  const fields = [
    {
      uid: "outer",
      rowUid: "root-row",
      typeClass: Fields.Group,
      order: 0,
      properties: { label: "Group", handle: "group", layout: "outer-layout" },
    },
    {
      uid: "inner",
      rowUid: "outer-row",
      typeClass: Fields.Group,
      order: 0,
      properties: { label: "Nested", handle: "nested", layout: "inner-layout" },
    },
    {
      uid: "text",
      rowUid: "inner-row",
      typeClass: Fields.Text,
      order: 0,
      properties: {
        label: "Name",
        handle: "name",
        defaultValue: "",
        required: false,
      },
    },
  ];
  store.dispatch(fieldActions.set(fields));
  store.dispatch(duplicate(fields[0], rows[0]));
  const copied = store
    .getState()
    .layout.fields.filter(
      (field) => !fields.some((original) => original.uid === field.uid),
    );
  expect(copied).toHaveLength(3);
  expect(
    store
      .getState()
      .layout.fields.filter((field) =>
        fields.some((original) => original.uid === field.uid),
      ),
  ).toEqual(fields);
  expect(
    new Set(
      store
        .getState()
        .layout.fields.map((field) =>
          String(field.properties.handle).toLowerCase(),
        ),
    ).size,
  ).toBe(6);
  expect(
    copied.find((field) => field.typeClass === Fields.Text)?.properties,
  ).toMatchObject({ defaultValue: "", required: false });
  const outerCopy = copied.find((field) =>
    store
      .getState()
      .layout.rows.some(
        (row) => row.uid === field.rowUid && row.layoutUid === "root",
      ),
  )!;
  for (const group of copied.filter(
    (field) => field.typeClass === Fields.Group,
  )) {
    expect(["outer-layout", "inner-layout"]).not.toContain(
      group.properties.layout,
    );
  }
  store.dispatch(remove(outerCopy));
  expect(store.getState().layout.fields).toEqual(fields);
  expect(store.getState().layout.rows).toEqual(rows);
  expect(store.getState().layout.layouts.map((layout) => layout.uid)).toEqual([
    "root",
    "outer-layout",
    "inner-layout",
  ]);
});
