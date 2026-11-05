import type { Item } from "./limited-users.types";

const group = (id: string, children: Item[]): Item => ({
  id,
  name: id,
  type: "group",
  children,
});
const flag = (id: string, children?: Item[]): Item => ({
  id,
  name: id,
  type: "boolean",
  enabled: true,
  children,
});
const choices = (id: string, values: string[]): Item => ({
  id,
  name: id,
  type: "toggles",
  values,
  options: values.map((value) => ({ value, label: value })),
});
export const textField =
  "Solspace\\Freeform\\Fields\\Implementations\\TextField";
export const htmlField =
  "Solspace\\Freeform\\Fields\\Implementations\\HtmlField";
export const signatureField =
  "Solspace\\Freeform\\Fields\\Implementations\\Pro\\SignatureField";
export const adminNotification =
  "Solspace\\Freeform\\Notifications\\Types\\Admin\\Admin";
export const conditionalNotification =
  "Solspace\\Freeform\\Notifications\\Types\\Conditional\\Conditional";

export const permissionFixture = (): Item[] => [
  group("layout", [
    flag("multiPageForms"),
    choices("fieldTypes", [
      textField,
      htmlField,
      signatureField,
      "Vendor\\CustomField",
    ]),
    flag("fields", [
      flag("handles"),
      flag("attributes"),
      flag("encrypted"),
      flag("types"),
      flag("clone"),
    ]),
    flag("buttons"),
    flag("fieldManager"),
    flag("formsFields"),
    flag("favoritesManager"),
    flag("favorite"),
    group("options", [
      flag("custom"),
      flag("elements", [choices("types", ["Assets", "Entries"])]),
      flag("predefined", [choices("types", ["States", "Languages"])]),
      flag("convert"),
    ]),
  ]),
  group("props", [
    choices("date", ["initialValue", "picker", "minuteStep", "futureProperty"]),
    choices("file", [
      "placeholder",
      "count",
      "source",
      "uploadLocation",
      "dialogSelector",
    ]),
    choices("html", ["twig"]),
    choices("table", ["addButtonLabel", "minRows", "tableAttributes"]),
  ]),
  group("notifications", [
    flag("tab", [
      flag(adminNotification),
      flag(conditionalNotification),
      flag("Solspace\\Freeform\\Notifications\\Types\\Dynamic\\Dynamic"),
      flag("Solspace\\Freeform\\Notifications\\Types\\EmailField\\EmailField"),
      flag("Vendor\\Notification"),
    ]),
  ]),
  group("rules", [flag("tab", [flag("fields"), flag("submit")])]),
  group("integrations", [flag("tab")]),
  group("settings", [
    flag("tab", [
      flag("general", [
        flag("handle"),
        flag("type"),
        flag("translations"),
        flag("submissionTitle"),
        flag("formattingTemplate"),
        flag("attributes"),
      ]),
      flag("data-storage"),
      flag("processing"),
      flag("success-and-errors", [flag("customMessageColors")]),
      flag("limits"),
    ]),
  ]),
  group("preview", [flag("tab")]),
  group("future", [flag("capability")]),
];

export const readPermissions = (
  items: Item[],
): Record<string, boolean | string | string[]> => {
  const values: Record<string, boolean | string | string[]> = {};
  const visit = (item: Item, prefix = ""): void => {
    const path = prefix ? `${prefix}.${item.id}` : item.id;
    if (item.type === "boolean") values[path] = item.enabled;
    if (item.type === "toggles") values[path] = item.values;
    if (item.type === "select") values[path] = item.value;
    item.children?.forEach((child) => {
      visit(child, path);
    });
  };
  items.forEach((item) => {
    visit(item);
  });
  return values;
};
