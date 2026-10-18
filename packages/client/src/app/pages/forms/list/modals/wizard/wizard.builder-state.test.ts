import { store as editorStore } from "@editor/store";
import { save } from "@editor/store/actions/form";
import type { FieldType } from "@ff-client/types/fields";
import { PropertyType } from "@ff-client/types/properties";
import axios from "axios";
import { expect, it, vi } from "vitest";
import {
  createWizardBuilderStore,
  syncWizardBuilder,
  wizardBuilderState,
} from "./wizard.builder-state";
import type { WizardDraft } from "./wizard.types";

vi.mock("axios", () => ({ default: { post: vi.fn(), get: vi.fn() } }));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@config/freeform/freeform.config", () => ({ default: {} }));

const type: FieldType = {
  name: "Text",
  type: "text",
  typeClass: "Text",
  visible: true,
  implements: [],
  properties: [
    { type: PropertyType.String, handle: "label", value: "Text" },
    { type: PropertyType.String, handle: "handle", value: "text" },
    { type: PropertyType.Boolean, handle: "required", value: false },
    { type: PropertyType.String, handle: "instructions", value: "" },
    {
      type: PropertyType.String,
      handle: "locked",
      value: "default",
      disabled: true,
    },
  ],
};
const draft: WizardDraft = {
  requestToken: "new-form",
  purpose: "contact",
  name: "Contact",
  siteIds: [1],
  fields: ["firstName", "lastName", "company"].map((key, index) => ({
    key,
    label: key,
    type: "text",
    rowId: index < 2 ? "names" : "company",
    width: "full",
    required: true,
    options: [] as string[],
    instructions: "",
  })),
  formattingTemplate: "basic.twig",
  storeData: true,
  successBehavior: "reload",
  successMessage: "Thanks!",
  errorMessage: "Try again",
  returnUrl: "",
  adminEnabled: false,
  adminEmail: "",
  adminTemplate: "",
  adminNewTemplate: true,
  confirmationEnabled: false,
  confirmationField: "",
  confirmationTemplate: "",
  confirmationNewTemplate: true,
};

it("renders the same shared rows with stable field IDs through edits and moves", () => {
  const state = wizardBuilderState(draft, [type]);
  expect(state.layout.fields).toHaveLength(3);
  expect(state.layout.rows.map((row) => row.uid)).toEqual(["names", "company"]);
  expect(
    state.layout.fields.map((field) => [field.uid, field.rowUid, field.order]),
  ).toEqual([
    ["wizard-field-firstName", "names", 0],
    ["wizard-field-lastName", "names", 1],
    ["wizard-field-company", "company", 0],
  ]);
  const changed = wizardBuilderState(
    {
      ...draft,
      fields: [
        draft.fields[2],
        { ...draft.fields[0], label: "Given name" },
        draft.fields[1],
      ],
    },
    [type],
  );
  expect(changed.layout.fields[1].uid).toBe(state.layout.fields[0].uid);
  expect(changed.layout.fields[1].properties.label).toBe("Given name");
  expect(changed.form.id).toBeNull();
});

it("updates the builder's General and Data Storage settings from Advanced choices", () => {
  const state = wizardBuilderState(
    {
      ...draft,
      handle: "inquiry",
      description: "Team notes",
      color: "#123456",
      defaultStatus: "2",
    },
    [type],
  );
  expect(state.form.settings.general).toMatchObject({
    handle: "inquiry",
    description: "Team notes",
    color: "#123456",
    defaultStatus: 2,
  });
});

it("uses available type defaults and custom choices without retaining unavailable settings", () => {
  const radios = {
    ...type,
    type: "radios",
    typeClass: "Radios",
    properties: [
      ...type.properties,
      {
        type: PropertyType.Options,
        handle: "optionConfiguration",
        value: { source: "custom", options: [] },
      },
      { type: PropertyType.Boolean, handle: "oneLine", value: false },
    ],
  } as FieldType;
  const state = wizardBuilderState(
    {
      ...draft,
      fields: [{ ...draft.fields[0], type: "radios", options: ["Yes", "No"] }],
    },
    [radios],
  );
  expect(state.layout.fields[0].properties).toMatchObject({
    oneLine: true,
    optionConfiguration: {
      source: "custom",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
  });
  expect(
    radios.properties.find((property) => property.handle === "oneLine")?.value,
  ).toBe(false);
  expect(state.layout.fields[0].properties).not.toHaveProperty("international");
});

it("isolates state and save actions from the live editor and the network", () => {
  const original = editorStore.getState();
  const store = createWizardBuilderStore();
  const other = createWizardBuilderStore();
  store.dispatch(syncWizardBuilder(wizardBuilderState(draft, [type])));
  store.dispatch(save());
  expect(axios.post).not.toHaveBeenCalled();
  expect(editorStore.getState()).toBe(original);
  expect(other.getState().layout.fields).toHaveLength(0);
});

it("keeps unchanged rows and fields intact when typing in one field", () => {
  const store = createWizardBuilderStore();
  store.dispatch(syncWizardBuilder(wizardBuilderState(draft, [type])));
  const before = store.getState();
  store.dispatch(
    syncWizardBuilder(
      wizardBuilderState(
        {
          ...draft,
          fields: draft.fields.map((field, index) =>
            index === 0 ? { ...field, label: "Changed" } : field,
          ),
        },
        [type],
      ),
    ),
  );
  expect(store.getState().layout.rows).toBe(before.layout.rows);
  expect(store.getState().layout.fields[1]).toBe(before.layout.fields[1]);
  expect(store.getState().layout.fields[2]).toBe(before.layout.fields[2]);
  expect(store.getState().layout.fields[0]).not.toBe(before.layout.fields[0]);
});
it("keeps the real builder Sites control synchronized with the wizard", () => {
  const state = wizardBuilderState({ ...draft, siteIds: [1, 3, 5] }, [type]);
  expect(state.form.settings.general.sites).toEqual(["1", "3", "5"]);
  const updated = wizardBuilderState({ ...draft, siteIds: [3] }, [type]);
  expect(updated.form.settings.general.sites).toEqual(["3"]);
  expect(draft.siteIds).toEqual([1]);
});

it("keeps newly added and preset phone fields out of international mode even when type defaults enable it", () => {
  const phone = {
    ...type,
    type: "phone",
    typeClass: "Phone",
    properties: [
      ...type.properties,
      { type: PropertyType.Boolean, handle: "international", value: true },
    ],
  } as FieldType;
  const state = wizardBuilderState(
    {
      ...draft,
      fields: ["phone", "extraPhone"].map((key) => ({
        ...draft.fields[0],
        key,
        type: "phone",
      })),
    },
    [phone],
  );
  expect(state.layout.fields).toHaveLength(2);
  expect(
    state.layout.fields.map((field) => field.properties.international),
  ).toEqual([false, false]);
  expect(phone.properties.at(-1)?.value).toBe(true);
});
