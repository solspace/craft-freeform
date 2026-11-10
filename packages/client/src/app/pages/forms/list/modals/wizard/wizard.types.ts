import type { OptionCollection } from "@ff-client/types/properties";

export type WizardField = {
  key: string;
  type: string;
  label: string;
  required: boolean;
  rowId?: string;
  width: "half" | "third" | "quarter" | "full";
  options: string[];
  instructions: string;
  adapted?: boolean;
};
export type Choice = { value: string; label: string; color?: string };
export type WizardOptions = {
  presets: {
    id: string;
    icon?: string;
    label: string;
    description: string;
    formDescription?: string;
    fields: WizardField[];
  }[];
  fieldTypes: (Choice & { editableProperties?: string[] })[];
  fieldLimit: number;
  editableSettings: string[];
  statuses?: Choice[];
  successBehaviors?: Choice[];
  allowDashesInHandles?: boolean;
  defaults: {
    description?: string;
    color?: string;
    defaultStatus?: string;
    formattingTemplate: string;
    storeData: boolean;
    successBehavior: string;
    successMessage: string;
    errorMessage: string;
    returnUrl: string;
  };
  formattingTemplates: Choice[];
  formattingTemplateGroups: OptionCollection;
  notificationTemplates: Choice[];
  notificationTemplateMode: "all" | "form" | "global";
  notificationTemplateScope: "form" | "global";
  canCreateNotificationTemplates: boolean;
  canNotify: boolean;
};
export type WizardDraft = WizardOptions["defaults"] & {
  handle?: string;
  type?: string;
  purpose: string;
  name: string;
  siteIds: number[];
  fields: WizardField[];
  adminEnabled: boolean;
  adminEmail: string;
  adminTemplate: string;
  adminNewTemplate: boolean;
  confirmationEnabled: boolean;
  confirmationField: string;
  confirmationTemplate: string;
  confirmationNewTemplate: boolean;
  requestToken: string;
};

export const fieldRows = (fields: WizardField[]): WizardField[][] => {
  const rows: WizardField[][] = [];
  for (const field of fields) {
    const previous = rows.at(-1);
    if (
      previous &&
      (field.rowId
        ? previous[0].rowId === field.rowId && previous.length < 4
        : !previous[0].rowId &&
          previous[0].width === field.width &&
          previous.length <
            { full: 1, half: 2, third: 3, quarter: 4 }[field.width])
    ) {
      previous.push(field);
    } else rows.push([field]);
  }
  return rows;
};

export const normalizeRows = (fields: WizardField[]): WizardField[] => {
  const used = new Set<string>();
  return fieldRows(fields).flatMap((row) => {
    const id =
      row[0].rowId && !used.has(row[0].rowId)
        ? row[0].rowId
        : crypto.randomUUID();
    used.add(id);
    return row.map((field) => ({ ...field, rowId: id }));
  });
};

/** Move by stable IDs; DOM order is only used to identify the insertion point. */
export function placeField(
  fields: WizardField[],
  key: string,
  rowId: string | undefined,
  beforeKey?: string,
  newRowBefore?: string,
): WizardField[] {
  const field = fields.find((item) => item.key === key);
  if (!field) return fields;
  const target = rowId
    ? fields.filter((item) => item.rowId === rowId && item.key !== key)
    : [];
  if (target.length >= 4) return fields;
  const remaining = fields.filter((item) => item.key !== key);
  let index: number;
  if (rowId) {
    index = beforeKey
      ? remaining.findIndex((item) => item.key === beforeKey)
      : -1;
    if (index < 0)
      index = remaining.findLastIndex((item) => item.rowId === rowId) + 1;
  } else {
    const originalIndex = newRowBefore
      ? fields.findIndex((item) => item.rowId === newRowBefore)
      : fields.length;
    index = fields
      .slice(0, originalIndex)
      .filter((item) => item.key !== key).length;
  }
  remaining.splice(index, 0, { ...field, rowId: rowId ?? crypto.randomUUID() });
  return remaining;
}
