import { describe, expect, it } from "vitest";
import {
  applyPermissionPreset,
  matchesPermissionPreset,
  permissionPresets,
} from "./limited-users.presets";
import {
  adminNotification,
  conditionalNotification,
  htmlField,
  permissionFixture,
  readPermissions,
  signatureField,
  textField,
} from "./limited-users.presets.test-fixtures";
import type { Item } from "./limited-users.types";

describe("limited-user permission starting points", () => {
  it("Full Access checks every available option so users can start from everything and make exceptions", () => {
    const limited = applyPermissionPreset(
      permissionFixture(),
      "simplified-building",
    );
    const full = readPermissions(applyPermissionPreset(limited, "full-access"));
    expect(full).toEqual(readPermissions(permissionFixture()));
    expect(full["props.html"]).toEqual(["twig"]);
    expect(full["future.capability"]).toBe(true);
    expect(full["integrations.tab"]).toBe(true);
    expect(readPermissions(limited)["integrations.tab"]).toBe(false);
  });
  it("keeps simplified building to essential fields and a simple single-page workflow", () => {
    const values = readPermissions(
      applyPermissionPreset(permissionFixture(), "simplified-building"),
    );
    expect(values).toMatchObject({
      "layout.fieldTypes": [textField],
      "layout.multiPageForms": false,
      "layout.fields": true,
      "layout.fields.clone": true,
      "layout.fields.handles": false,
      "layout.fields.attributes": false,
      "layout.fields.encrypted": false,
      "layout.fields.types": false,
      "layout.options.custom": true,
      "layout.options.elements": false,
      "layout.options.elements.types": [],
      "layout.options.predefined": false,
      "layout.options.predefined.types": [],
      "props.date": ["initialValue", "picker"],
      "props.html": [],
      "props.file": [],
      "notifications.tab": true,
      [`notifications.tab.${adminNotification}`]: true,
      [`notifications.tab.${conditionalNotification}`]: false,
      "notifications.tab.Solspace\\Freeform\\Notifications\\Types\\Dynamic\\Dynamic": false,
      "notifications.tab.Solspace\\Freeform\\Notifications\\Types\\EmailField\\EmailField": false,
      "notifications.tab.Vendor\\Notification": false,
      "rules.tab": false,
      "integrations.tab": false,
      "settings.tab": false,
      "preview.tab": true,
      "future.capability": false,
    });
  });
  it("extends simplified building with upload controls only when setup calls for uploads", () => {
    const items = permissionFixture();
    const uploadFields = [
      "Solspace\\Freeform\\Fields\\Implementations\\FileUploadField",
      "Solspace\\Freeform\\Fields\\Implementations\\Pro\\FileDragAndDropField",
    ];
    const layout = items.find(({ id }) => id === "layout")!;
    const fields = layout.children!.find(({ id }) => id === "fieldTypes")!;
    if (fields.type !== "toggles")
      throw new Error("Missing field type catalog");
    fields.options.push(
      ...uploadFields.map((value) => ({ value, label: value })),
    );
    const standard = readPermissions(
      applyPermissionPreset(items, "simplified-building"),
    );
    const withUploads = readPermissions(
      applyPermissionPreset(items, "simplified-building", true),
    );
    expect(standard["layout.fieldTypes"]).toEqual([textField]);
    expect(standard["props.file"]).toEqual([]);
    expect(withUploads["layout.fieldTypes"]).toEqual([
      textField,
      ...uploadFields,
    ]);
    expect(withUploads["props.file"]).toEqual(["placeholder", "count"]);
    expect(withUploads["layout.fields.attributes"]).toBe(false);
    expect(withUploads["settings.tab"]).toBe(false);
  });
  it("lets content editors update existing content and preview without adding fields or exposing technical tools", () => {
    const values = readPermissions(
      applyPermissionPreset(permissionFixture(), "content-editor"),
    );
    expect(values).toMatchObject({
      "layout.fieldTypes": [],
      "layout.fields": false,
      "layout.fields.clone": false,
      "layout.fields.handles": false,
      "layout.fields.attributes": false,
      "layout.fields.encrypted": false,
      "layout.options.custom": true,
      "layout.options.predefined": true,
      "layout.options.predefined.types": ["States", "Languages"],
      "layout.options.elements": false,
      "layout.options.elements.types": [],
      "props.date": ["initialValue"],
      "props.html": [],
      "props.file": ["placeholder"],
      "notifications.tab": false,
      [`notifications.tab.${adminNotification}`]: false,
      "rules.tab": false,
      "integrations.tab": false,
      "settings.tab": false,
      "settings.tab.general": false,
      "preview.tab": true,
      "future.capability": false,
    });
  });

  it("adds advanced building workflows while keeping technical and unknown permissions disabled", () => {
    const values = readPermissions(
      applyPermissionPreset(permissionFixture(), "advanced-building"),
    );
    expect(values).toMatchObject({
      "layout.fieldTypes": [
        textField,
        htmlField,
        signatureField,
        "Vendor\\CustomField",
      ],
      "layout.options.elements": true,
      "layout.options.elements.types": ["Assets", "Entries"],
      [`notifications.tab.${conditionalNotification}`]: true,
      "notifications.tab.Vendor\\Notification": false,
      "rules.tab": true,
      "rules.tab.fields": true,
      "settings.tab": true,
      "settings.tab.general": true,
      "settings.tab.general.translations": true,
      "settings.tab.general.formattingTemplate": false,
      "settings.tab.general.attributes": false,
      "settings.tab.general.handle": false,
      "settings.tab.data-storage": false,
      "settings.tab.processing": false,
      "settings.tab.success-and-errors": true,
      "settings.tab.success-and-errors.customMessageColors": false,
      "settings.tab.limits": true,
      "integrations.tab": false,
      "future.capability": false,
    });
  });

  it("does not mutate the previous configuration and works with translated labels and edition-specific options", () => {
    const items: Item[] = [
      {
        id: "layout",
        name: "Mise en page",
        type: "group",
        children: [
          {
            id: "fieldTypes",
            name: "Types de champs",
            type: "toggles",
            values: [],
            options: [{ value: textField, label: "Texte" }],
          },
        ],
      },
    ];
    const before = structuredClone(items);
    const result = applyPermissionPreset(items, "simplified-building");
    expect(items).toEqual(before);
    expect(readPermissions(result)["layout.fieldTypes"]).toEqual([textField]);
    expect(result[0].name).toBe("Mise en page");
  });

  it("replacing a broad preset clears previous grants and manual adjustments clear the preset match", () => {
    const full = permissionFixture();
    const creator = applyPermissionPreset(full, "simplified-building");
    expect(readPermissions(creator)["integrations.tab"]).toBe(false);
    expect(readPermissions(creator)["props.html"]).toEqual([]);
    expect(matchesPermissionPreset(creator, "simplified-building")).toBe(true);
    const changed = creator.map((item) =>
      item.id === "integrations"
        ? {
            ...item,
            children: [
              {
                id: "tab",
                name: "Integrations Tab",
                type: "boolean" as const,
                enabled: true,
              },
            ],
          }
        : item,
    );
    expect(matchesPermissionPreset(changed, "simplified-building")).toBe(false);
  });

  it.each(permissionPresets)(
    "applying $label twice keeps the same permissions",
    ({ id }) => {
      const first = applyPermissionPreset(permissionFixture(), id);
      expect(applyPermissionPreset(first, id)).toEqual(first);
      expect(matchesPermissionPreset(first, id)).toBe(true);
      expect(matchesPermissionPreset([], id)).toBe(false);
    },
  );

  it.each(permissionPresets)(
    "$label does not enable a parent with every child permission disabled",
    ({ id }) => {
      const items = applyPermissionPreset(permissionFixture(), id);
      const granted = (item: Item): boolean =>
        item.type === "boolean"
          ? item.enabled
          : item.type === "toggles"
            ? item.values.length > 0
            : (item.children?.some(granted) ?? false);
      const visit = (item: Item): void => {
        // Success & Errors also grants its own message/redirect controls.
        // Its appearance child can be disabled independently.
        if (
          item.type === "boolean" &&
          item.enabled &&
          item.children?.length &&
          item.id !== "success-and-errors"
        ) {
          expect(item.children.some(granted), item.id).toBe(true);
        }
        item.children?.forEach((child) => {
          visit(child);
        });
      };
      items.forEach((item) => {
        visit(item);
      });
    },
  );
});
