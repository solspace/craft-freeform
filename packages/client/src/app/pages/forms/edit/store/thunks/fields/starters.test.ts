import type { WizardField } from "@ff-client/app/pages/forms/list/modals/wizard/wizard.types";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import { reducer } from "../..";
import { historyActions } from "../../history";
import { createHistoryMiddleware } from "../../middleware/history";
import { contextActions } from "../../slices/context";
import { formActions } from "../../slices/form";
import { fieldActions } from "../../slices/layout/fields";
import { layoutActions } from "../../slices/layout/layouts";
import { pageActions } from "../../slices/layout/pages";
import { rowActions } from "../../slices/layout/rows";
import { addFormStarter } from "./starters";

const types: FieldType[] = [Fields.Text, Fields.Email, Fields.Dropdown].map(
  (typeClass) => ({
    name: "Input",
    typeClass,
    type: "field",
    visible: true,
    implements: [],
    properties: [
      { handle: "label", type: PropertyType.String, value: "" },
      { handle: "handle", type: PropertyType.String, value: "" },
      { handle: "required", type: PropertyType.Boolean, value: false },
      { handle: "instructions", type: PropertyType.String, value: "" },
      {
        handle: "optionConfiguration",
        type: PropertyType.Options,
        value: null,
      },
    ] as FieldType["properties"],
  }),
);

const fields: WizardField[] = [
  {
    key: "name",
    type: "text",
    label: "Name",
    width: "half",
    required: true,
    options: [],
    instructions: "",
  },
  {
    key: "email",
    type: "email",
    label: "Email",
    width: "half",
    required: true,
    options: [],
    instructions: "",
  },
  {
    key: "reason",
    type: "dropdown",
    label: "Reason",
    width: "full",
    required: false,
    options: ["Sales", "Support"],
    instructions: "Choose one",
  },
];

const createStore = (page = false) => {
  const store = configureStore({
    reducer,
    middleware: (defaults) => defaults().concat(createHistoryMiddleware()),
  });
  store.dispatch(layoutActions.set([{ uid: "canvas" }]));
  store.dispatch(
    pageActions.set([
      { uid: "page", layoutUid: "canvas", order: 0, label: "Page 1" },
    ]),
  );
  store.dispatch(contextActions.setPage("page"));
  if (page) {
    store.dispatch(
      formActions.update({
        type: "Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page",
      }),
    );
    store.dispatch(layoutActions.add({ uid: "form-layout" }));
    store.dispatch(rowActions.add({ uid: "form-row", layoutUid: "canvas" }));
    store.dispatch(
      fieldActions.add({
        uid: "form-section",
        rowUid: "form-row",
        fieldType: {
          name: "Form",
          typeClass: Fields.FormSection,
          type: "layout",
          visible: true,
          implements: [],
          properties: [],
        },
      }),
    );
    store.dispatch(
      fieldActions.edit({
        uid: "form-section",
        handle: "layout",
        value: "form-layout",
      }),
    );
  }
  return store;
};

describe("Form Starters", () => {
  it.each([false, true])(
    "adds grouped fields to the %s form area with unique handles and one undo step",
    async (page) => {
      const store = createStore(page);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const before = store.getState().layout;
      expect(store.dispatch(addFormStarter(fields, types))).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(store.dispatch(addFormStarter(fields, types))).toBe(true);
      const inserted = store.getState().layout;
      const destination = page ? "form-layout" : "canvas";
      expect(
        inserted.rows.filter((row) => row.layoutUid === destination),
      ).toHaveLength(4);
      expect(
        inserted.fields.filter(
          (field) => field.typeClass !== Fields.FormSection,
        ),
      ).toHaveLength(6);
      expect(
        new Set(inserted.fields.map((field) => field.properties.handle)).size,
      ).toBe(inserted.fields.length);
      expect(
        inserted.fields.find((field) => field.properties.handle === "reason")
          ?.properties.optionConfiguration.options,
      ).toHaveLength(2);
      await new Promise((resolve) => setTimeout(resolve, 0));
      store.dispatch(historyActions.undo());
      expect(store.getState().layout.fields).toHaveLength(
        before.fields.length + 3,
      );
      store.dispatch(historyActions.undo());
      expect(store.getState().layout).toEqual(before);
    },
  );

  it("keeps Page form fields out of the outer canvas and does not insert if Form is missing", () => {
    const store = createStore(true);
    expect(store.dispatch(addFormStarter(fields, types))).toBe(true);
    expect(
      store.getState().layout.rows.filter((row) => row.layoutUid === "canvas"),
    ).toHaveLength(1);
    store.dispatch(fieldActions.remove("form-section"));
    expect(store.dispatch(addFormStarter(fields, types))).toBe(false);
  });

  it("adds starters containing the Pro Date & Time field returned by the server", () => {
    const store = createStore();
    const dateType: FieldType = {
      ...types[0],
      typeClass:
        "Solspace\\Freeform\\Fields\\Implementations\\Pro\\DatetimeField",
    };
    const dateField: WizardField = {
      key: "preferredDate",
      type: "datetime",
      label: "Preferred date",
      width: "half",
      required: true,
      options: [],
      instructions: "",
    };

    expect(
      store.dispatch(addFormStarter([dateField], [...types, dateType])),
    ).toBe(true);
    expect(store.getState().layout.fields[0].typeClass).toBe(
      dateType.typeClass,
    );
  });
});
