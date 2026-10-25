import { Fields } from "@ff-client/types/field.classes";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { reducer } from "..";
import { contextActions } from "../slices/context";
import { fieldActions } from "../slices/layout/fields";
import { layoutActions } from "../slices/layout/layouts";
import { pageActions } from "../slices/layout/pages";
import { rowActions } from "../slices/layout/rows";
import { canPlaceField } from "./fields/containers";
import newField from "./fields/move/new";
import { changeFormType, PAGE_FORM_TYPE } from "./form-section";

const REGULAR = "Solspace\\Freeform\\Form\\Types\\Regular";

const setup = () => {
  const store = configureStore({ reducer });
  store.dispatch(layoutActions.set([{ uid: "canvas" }, { uid: "step-two" }]));
  store.dispatch(
    pageActions.set([
      { uid: "page-one", label: "First", layoutUid: "canvas", order: 0 },
      { uid: "page-two", label: "Second", layoutUid: "step-two", order: 1 },
    ]),
  );
  store.dispatch(
    rowActions.set([
      { uid: "hero-row", layoutUid: "canvas", order: 0 },
      { uid: "input-row", layoutUid: "canvas", order: 1 },
      { uid: "second-input-row", layoutUid: "step-two", order: 0 },
    ]),
  );
  store.dispatch(
    fieldActions.set([
      {
        uid: "hero",
        rowUid: "hero-row",
        typeClass: Fields.Heading,
        properties: { label: "Hero", handle: "hero" },
        order: 0,
      },
      {
        uid: "name",
        rowUid: "input-row",
        typeClass: Fields.Text,
        properties: { label: "Name", handle: "name" },
        order: 0,
      },
      {
        uid: "email",
        rowUid: "second-input-row",
        typeClass: Fields.Email,
        properties: { label: "Email", handle: "email" },
        order: 0,
      },
    ]),
  );
  return store;
};

describe("Page form section", () => {
  it("keeps a shared canvas and preserves fields when switching back to Regular", () => {
    const store = setup();
    store.dispatch(changeFormType(PAGE_FORM_TYPE));
    const pageState = store.getState();
    const section = pageState.layout.fields.find(
      (field) => field.typeClass === Fields.FormSection,
    );
    expect(section).toBeDefined();
    expect(
      pageState.layout.rows.filter((row) => row.layoutUid === "canvas"),
    ).toHaveLength(1);
    expect(
      pageState.layout.rows.filter(
        (row) => row.layoutUid === section?.properties.layout,
      ),
    ).toHaveLength(2);
    expect(
      pageState.layout.rows.find((row) => row.uid === "second-input-row")
        ?.layoutUid,
    ).toBe("step-two");

    // An editor moves the hero outside the Form section. It stays above the
    // fields when the form returns to a regular builder layout.
    store.dispatch(
      rowActions.moveToLayoutAt({
        uid: "hero-row",
        layoutUid: "canvas",
        order: 0,
      }),
    );
    store.dispatch(changeFormType(REGULAR));
    const regular = store.getState();
    expect(
      regular.layout.fields.some(
        (field) => field.typeClass === Fields.FormSection,
      ),
    ).toBe(false);
    expect(
      regular.layout.rows
        .filter((row) => row.layoutUid === "canvas")
        .sort((a, b) => a.order - b.order)
        .map((row) => row.uid),
    ).toEqual(["hero-row", "input-row"]);
    expect(
      regular.layout.fields.map((field) => field.properties.handle),
    ).toEqual(["hero", "name", "email"]);
  });

  it("accepts inputs only inside the Form section or a later step", () => {
    const store = setup();
    store.dispatch(changeFormType(PAGE_FORM_TYPE));
    const state = store.getState();
    const sectionLayout = state.layout.fields.find(
      (field) => field.typeClass === Fields.FormSection,
    )?.properties.layout as string;
    expect(canPlaceField(state, { typeClass: Fields.Text }, "canvas")).toBe(
      false,
    );
    expect(
      canPlaceField(state, { typeClass: Fields.Text }, sectionLayout),
    ).toBe(true);
    expect(canPlaceField(state, { typeClass: Fields.Email }, "step-two")).toBe(
      true,
    );
    expect(canPlaceField(state, { typeClass: Fields.Heading }, "canvas")).toBe(
      true,
    );
  });

  it("moves the whole Form into a canvas layout column and unwraps there", () => {
    const store = setup();
    store.dispatch(changeFormType(PAGE_FORM_TYPE));
    const section = store
      .getState()
      .layout.fields.find((field) => field.typeClass === Fields.FormSection)!;
    store.dispatch(layoutActions.add({ uid: "column-content" }));
    store.dispatch(rowActions.add({ uid: "column-row", layoutUid: "canvas" }));
    store.dispatch(
      fieldActions.add({
        uid: "column",
        rowUid: "column-row",
        fieldType: {
          name: "Column",
          typeClass: Fields.LayoutColumn,
          type: "layout-column",
          visible: false,
          implements: [],
          properties: [],
        },
      }),
    );
    store.dispatch(
      fieldActions.edit({
        uid: "column",
        handle: "layout",
        value: "column-content",
      }),
    );
    expect(canPlaceField(store.getState(), section, "column-content")).toBe(
      true,
    );
    expect(canPlaceField(store.getState(), section, "step-two")).toBe(false);
    expect(
      canPlaceField(
        store.getState(),
        section,
        section.properties.layout as string,
      ),
    ).toBe(false);

    store.dispatch(
      rowActions.moveToLayoutAt({
        uid: section.rowUid,
        layoutUid: "column-content",
        order: 0,
      }),
    );
    store.dispatch(changeFormType(REGULAR));
    const state = store.getState();
    expect(
      state.layout.fields.some(
        (field) => field.typeClass === Fields.FormSection,
      ),
    ).toBe(false);
    expect(
      state.layout.rows
        .filter((row) => row.layoutUid === "column-content")
        .map((row) => row.uid),
    ).toEqual(["hero-row", "input-row"]);
  });

  it("adds a new input to the selected later step", () => {
    const store = setup();
    store.dispatch(changeFormType(PAGE_FORM_TYPE));
    store.dispatch(contextActions.setPage("page-two"));
    store.dispatch(
      newField.newRow({
        fieldType: {
          name: "Text",
          typeClass: Fields.Text,
          type: "text",
          visible: true,
          implements: [],
          properties: [],
        },
      }),
    );
    const state = store.getState();
    const added = state.layout.fields.find(
      (field) =>
        field.uid !== "hero" &&
        field.uid !== "name" &&
        field.uid !== "email" &&
        field.typeClass === Fields.Text,
    );
    expect(added).toBeDefined();
    expect(
      state.layout.rows.find((row) => row.uid === added?.rowUid)?.layoutUid,
    ).toBe("step-two");
  });
});
