import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { reducer } from "..";
import { historyActions } from "../history";
import { fieldActions } from "../slices/layout/fields";
import { layoutActions } from "../slices/layout/layouts";
import { pageActions } from "../slices/layout/pages";
import { rowActions } from "../slices/layout/rows";
import { createHistoryMiddleware } from "./history";

const makeStore = () =>
  configureStore({
    reducer,
    middleware: (defaults) => defaults().concat(createHistoryMiddleware()),
  });

const settle = async (): Promise<void> => {
  await Promise.resolve();
};

describe("builder history", () => {
  it("restores a deleted page, its rows and nested fields as one step", async () => {
    const store = makeStore();
    store.dispatch(layoutActions.set([{ uid: "layout-1" }]));
    store.dispatch(
      pageActions.set([
        { uid: "page-1", label: "First", layoutUid: "layout-1", order: 0 },
      ]),
    );
    store.dispatch(
      rowActions.set([{ uid: "row-1", layoutUid: "layout-1", order: 0 }]),
    );
    store.dispatch(
      fieldActions.set([
        {
          uid: "field-1",
          rowUid: "row-1",
          typeClass: "Text",
          properties: { label: "First", handle: "first" },
        },
      ]),
    );

    store.dispatch(fieldActions.remove("field-1"));
    store.dispatch(rowActions.remove("row-1"));
    store.dispatch(layoutActions.remove("layout-1"));
    store.dispatch(pageActions.remove("page-1"));
    await settle();

    expect(store.getState().history.undoCount).toBe(1);
    store.dispatch(historyActions.undo());
    expect(store.getState().layout.fields).toHaveLength(1);
    expect(store.getState().layout.pages).toHaveLength(1);
    expect(store.getState().layout.rows).toHaveLength(1);
    expect(store.getState().layout.layouts).toHaveLength(1);
    store.dispatch(historyActions.redo());
    expect(store.getState().layout.fields).toHaveLength(0);
    expect(store.getState().layout.pages).toHaveLength(0);
  });

  it("groups typing but discards redo after a different edit", async () => {
    const store = makeStore();
    store.dispatch(
      fieldActions.set([
        {
          uid: "field-1",
          rowUid: "row-1",
          typeClass: "Text",
          properties: { label: "First", handle: "first" },
        },
      ]),
    );
    store.dispatch(
      fieldActions.edit({ uid: "field-1", handle: "label", value: "Second" }),
    );
    await settle();
    store.dispatch(
      fieldActions.edit({ uid: "field-1", handle: "label", value: "Third" }),
    );
    await settle();

    expect(store.getState().history.undoCount).toBe(1);
    store.dispatch(historyActions.undo());
    expect(store.getState().layout.fields[0].properties.label).toBe("First");
    store.dispatch(
      fieldActions.edit({
        uid: "field-1",
        handle: "label",
        value: "Different",
      }),
    );
    await settle();
    expect(store.getState().history.redoCount).toBe(0);
  });

  it("groups a label and generated handle, while preserving separate property edits", async () => {
    const store = makeStore();
    store.dispatch(
      fieldActions.set([
        {
          uid: "field-1",
          rowUid: "row-1",
          typeClass: "Text",
          properties: { label: "First", handle: "first", placeholder: "" },
        },
      ]),
    );
    store.dispatch(
      fieldActions.edit({ uid: "field-1", handle: "label", value: "Second" }),
    );
    store.dispatch(
      fieldActions.edit({ uid: "field-1", handle: "handle", value: "second" }),
    );
    await settle();
    expect(store.getState().history.undoCount).toBe(1);

    store.dispatch(
      fieldActions.edit({
        uid: "field-1",
        handle: "placeholder",
        value: "Hint",
      }),
    );
    await settle();
    expect(store.getState().history.undoCount).toBe(2);
    store.dispatch(historyActions.undo());
    expect(store.getState().layout.fields[0].properties).toMatchObject({
      label: "Second",
      handle: "second",
      placeholder: "",
    });
  });

  it("clears history on reload or successful save, not on validation errors", async () => {
    const store = makeStore();
    store.dispatch(
      fieldActions.set([
        {
          uid: "field-1",
          rowUid: "row-1",
          typeClass: "Text",
          properties: { label: "First" },
        },
      ]),
    );
    store.dispatch(
      fieldActions.edit({ uid: "field-1", handle: "label", value: "Second" }),
    );
    store.dispatch(
      fieldActions.setErrors({ "field-1": { label: ["Required"] } }),
    );
    await settle();
    expect(store.getState().history.undoCount).toBe(1);

    store.dispatch(historyActions.clear());
    expect(store.getState().history.undoCount).toBe(0);
    store.dispatch(
      fieldActions.edit({ uid: "field-1", handle: "label", value: "Third" }),
    );
    await settle();
    store.dispatch(fieldActions.set([]));
    expect(store.getState().history.undoCount).toBe(0);
  });
});
