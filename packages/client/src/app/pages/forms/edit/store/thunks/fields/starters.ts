import config, { Edition } from "@config/freeform/freeform.config";
import type { AppThunk } from "@editor/store";
import { contextActions, FocusType } from "@editor/store/slices/context";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { rowActions } from "@editor/store/slices/layout/rows";
import {
  fieldRows,
  type WizardField,
} from "@ff-client/app/pages/forms/list/modals/wizard/wizard.types";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { v4 } from "uuid";
import { canPlaceField, isPageForm } from "./containers";

const starterTypes: Record<string, Fields> = {
  text: Fields.Text,
  email: Fields.Email,
  textarea: Fields.Textarea,
  dropdown: Fields.Dropdown,
  radios: Fields.Radios,
  checkboxes: Fields.Checkboxes,
  number: Fields.Number,
  phone: Fields.Phone,
  website: Fields.Website,
  datetime: Fields.Datetime,
  rating: Fields.Rating,
  file: Fields.FileUpload,
};

const starterFieldType = (type: FieldType, field: WizardField): FieldType => {
  const values: Record<string, unknown> = {
    label: field.label,
    handle: field.key,
    required: field.required,
    instructions: field.instructions,
    browserAutofill:
      {
        firstName: "given-name",
        lastName: "family-name",
        email: "email",
        phone: "tel",
        company: "organization",
        organization: "organization",
        website: "url",
        portfolio: "url",
      }[field.key] ?? "",
  };
  if (field.options.length) {
    values.optionConfiguration = {
      source: "custom",
      useCustomValues: false,
      options: field.options.map((label) => ({
        label,
        value: label,
        optgroup: false,
      })),
      ...(field.type === "dropdown" ? { emptyOption: "Please select" } : {}),
    };
  }
  if (field.type === "dropdown") values.defaultValue = "";
  if (field.type === "radios") values.oneLine = true;
  if (field.type === "datetime") {
    values.dateTimeType = "date";
  }
  if (field.type === "rating") values.maxValue = 5;

  return {
    ...type,
    properties: type.properties.map((property) =>
      Object.hasOwn(values, property.handle)
        ? { ...property, value: values[property.handle] }
        : property,
    ) as FieldType["properties"],
  };
};

/** Insert a wizard preset into the form area, preserving its row groupings. */
export const addFormStarter =
  (fields: WizardField[], types: FieldType[]): AppThunk<boolean> =>
  (dispatch, getState) => {
    const state = getState();
    const currentPage = state.layout.pages.find(
      (page) => page.uid === state.context.page,
    );
    if (!currentPage || !fields.length) return false;

    let layoutUid = currentPage.layoutUid;
    if (isPageForm(state) && currentPage.uid === state.layout.pages[0]?.uid) {
      layoutUid = state.layout.fields.find(
        (field) => field.typeClass === Fields.FormSection,
      )?.properties.layout as string;
    }
    if (
      !layoutUid ||
      !state.layout.layouts.some((item) => item.uid === layoutUid)
    )
      return false;
    if (
      config.editions.is(Edition.Express) &&
      state.layout.fields.length + fields.length > config.limits.fields
    )
      return false;

    const prepared = fields.map((field) => {
      const type = types.find(
        (item) => item.visible && item.typeClass === starterTypes[field.type],
      );
      return type ? starterFieldType(type, field) : undefined;
    });
    if (
      prepared.some((type) => !type || !canPlaceField(state, type, layoutUid))
    )
      return false;

    let index = 0;
    let firstUid: string | undefined;
    for (const group of fieldRows(fields)) {
      const rowUid = v4();
      dispatch(rowActions.add({ uid: rowUid, layoutUid }));
      for (const _field of group) {
        const uid = v4();
        dispatch(
          fieldActions.add({ uid, rowUid, fieldType: prepared[index++]! }),
        );
        firstUid ??= uid;
      }
    }
    if (firstUid)
      dispatch(
        contextActions.setFocusedItem({ type: FocusType.Field, uid: firstUid }),
      );
    return true;
  };
