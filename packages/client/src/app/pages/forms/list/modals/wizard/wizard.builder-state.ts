import { type RootState, reducer } from "@editor/store";
import type { Field } from "@editor/store/slices/layout/fields";
import type {
  FieldType,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import type {
  FormSettingNamespace,
  SettingCollection,
} from "@ff-client/types/forms";
import { configureStore, createAction } from "@reduxjs/toolkit";
import { fieldRows, type WizardDraft } from "./wizard.types";

const sync = createAction<RootState>("wizard/sync-builder");

// Deliberately omit the editor's persistence and history middleware. The wizard
// is the only writer, and its final Create action is the only server write.
export function createWizardBuilderStore() {
  return configureStore({
    reducer: (state: RootState | undefined, action) =>
      sync.match(action)
        ? reconcileBuilderState(state, action.payload)
        : reducer(state, action),
  });
}

export function wizardBuilderState(
  draft: WizardDraft,
  types: FieldType[],
  namespaces: FormSettingNamespace[] = [],
): RootState {
  const state = reducer(undefined, { type: "wizard/init" });
  const layoutUid = `wizard-layout-${draft.requestToken}`;
  const pageUid = `wizard-page-${draft.requestToken}`;
  const rows = fieldRows(draft.fields);
  const defaults: SettingCollection = Object.fromEntries(
    namespaces.map((namespace) => [
      namespace.handle,
      {
        namespaceType: "settings",
        namespace: namespace.handle,
        ...Object.fromEntries(
          namespace.properties.map((property) => [
            property.handle,
            structuredClone(property.value),
          ]),
        ),
      },
    ]),
  );
  const fields: Field[] = rows.flatMap((row) =>
    row.flatMap((field, order) => {
      const type = types.find((item) => item.type === field.type);
      if (!type) return [];
      const properties: PropertyValueCollection = Object.fromEntries(
        type.properties.map((property) => [
          property.handle,
          structuredClone(property.value),
        ]),
      );
      const changes: PropertyValueCollection = {
        label: field.label,
        handle: field.key.startsWith("extra")
          ? `customField${draft.fields.indexOf(field)}`
          : field.key,
        required: field.required,
        instructions: field.instructions,
      };
      if (field.type === "phone")
        Object.assign(changes, {
          international: false,
          allowedCountries: "",
          pattern: null,
          useJsMask: false,
        });
      if (field.type === "datetime")
        Object.assign(changes, {
          dateTimeType: "date",
          initialValue: "",
        });
      if (field.type === "rating")
        Object.assign(changes, { maxValue: 5, defaultValue: "" });
      if (field.type === "number")
        Object.assign(changes, {
          allowNegative: false,
          decimalCount: 0,
          minMaxValues: [field.key === "attendees" ? 1 : 0, null],
        });
      if (["dropdown", "radios", "checkboxes"].includes(field.type)) {
        changes.optionConfiguration = {
          source: "custom",
          useCustomValues: false,
          options: field.options.map((label) => ({
            label,
            value: label,
            optgroup: false,
          })),
          ...(field.type === "dropdown"
            ? { emptyOption: "Please select" }
            : {}),
        };
        if (field.type === "radios") changes.oneLine = true;
      }
      // Use only the settings available to this field type and edition.
      for (const property of type.properties) {
        if (
          property.visible !== false &&
          !property.disabled &&
          property.handle in changes
        )
          properties[property.handle] = changes[property.handle];
      }
      return [
        {
          id: -(draft.fields.indexOf(field) + 1),
          uid: `wizard-field-${field.key}`,
          rowUid: row[0].rowId,
          order,
          typeClass: type.typeClass,
          properties,
        },
      ];
    }),
  );
  return {
    ...state,
    form: {
      ...state.form,
      uid: draft.requestToken,
      name: draft.name,
      isNew: true,
      settings: {
        ...defaults,
        general: {
          ...defaults.general,
          namespaceType: "settings",
          namespace: "general",
          formattingTemplate: draft.formattingTemplate,
          storeData: draft.storeData,
          name: draft.name,
          ...(draft.handle !== undefined ? { handle: draft.handle } : {}),
          ...(draft.description !== undefined
            ? { description: draft.description }
            : {}),
          ...(draft.color !== undefined ? { color: draft.color } : {}),
          ...(draft.defaultStatus
            ? { defaultStatus: Number(draft.defaultStatus) }
            : {}),
          sites: draft.siteIds.map(String),
        },
        behavior: {
          ...defaults.behavior,
          namespaceType: "settings",
          namespace: "behavior",
          successBehavior: draft.successBehavior,
          successMessage: draft.successMessage,
          errorMessage: draft.errorMessage,
          returnUrl: draft.returnUrl,
        },
      },
    },
    context: { ...state.context, page: pageUid },
    layout: {
      layouts: [{ uid: layoutUid }],
      pages: [
        {
          uid: pageUid,
          label: "Page 1",
          layoutUid,
          order: 0,
          buttons: {
            layout: "submit",
            submitLabel: "Submit",
            attributes: {},
            submitIcon: [],
            submitIconPosition: "left",
            back: false,
            backLabel: "Back",
            backIcon: [],
            backIconPosition: "left",
            save: false,
            saveLabel: "Save",
            saveIcon: [],
            saveIconPosition: "left",
          },
        },
      ],
      rows: rows.map((row, order) => ({
        uid: row[0].rowId!,
        layoutUid,
        order,
      })),
      fields,
    },
  };
}

export const syncWizardBuilder = sync;

function reconcileBuilderState(
  previous: RootState | undefined,
  next: RootState,
): RootState {
  if (!previous) return next;
  function retain<T extends { uid: string }>(items: T[], old: T[]) {
    const byUid = new Map(old.map((item) => [item.uid, item]));
    const result = items.map((item) => {
      const original = byUid.get(item.uid);
      return original && JSON.stringify(original) === JSON.stringify(item)
        ? original
        : item;
    });
    return result.length === old.length &&
      result.every((item, index) => item === old[index])
      ? old
      : result;
  }
  return {
    ...next,
    layout: {
      fields: retain(next.layout.fields, previous.layout.fields),
      rows: retain(next.layout.rows, previous.layout.rows),
      pages: retain(next.layout.pages, previous.layout.pages),
      layouts: retain(next.layout.layouts, previous.layout.layouts),
    },
  };
}
