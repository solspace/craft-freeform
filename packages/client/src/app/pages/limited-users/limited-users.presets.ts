import definitions from "../../../../../plugin/src/Bundles/Form/Limiting/LimitedUsers/presets.json";
import type { Item } from "./limited-users.types";

export type PermissionPresetId =
  | "content-editor"
  | "simplified-building"
  | "advanced-building"
  | "full-access";

type PermissionPreset = {
  id: PermissionPresetId;
  label: string;
  description: string;
  permissions: string[];
  options: Record<string, string[] | "*">;
  fullAccess: boolean;
};

export const permissionPresets = definitions.presets as PermissionPreset[];

// Resolve stable permission paths and values against the options supplied by the
// server. Unknown permission controls stay disabled unless a preset explicitly
// enables an entire option group, such as all available field types.
export const applyPermissionPreset = (
  items: Item[],
  presetId: PermissionPresetId,
  uploads = false,
): Item[] => {
  const preset = permissionPresets.find(({ id }) => id === presetId)!;
  const permissions = new Set(preset.permissions);
  const options = { ...preset.options };
  if (uploads && presetId === "simplified-building") {
    for (const [path, extra] of Object.entries(definitions.uploadOptions)) {
      options[path] = [...(options[path] ?? []), ...extra];
    }
  }

  const visit = (item: Item, prefix: string, parentEnabled: boolean): Item => {
    const path = prefix ? `${prefix}.${item.id}` : item.id;
    let updated = { ...item };
    let enabled = parentEnabled;

    if (item.type === "boolean") {
      enabled = parentEnabled && (preset.fullAccess || permissions.has(path));
      updated = { ...item, enabled };
    } else if (item.type === "toggles") {
      const allowed = options[path] ?? [];
      const allOptions = preset.fullAccess || allowed === "*";
      updated = {
        ...item,
        values: parentEnabled
          ? item.options
              .filter(({ value }) => allOptions || allowed.includes(value))
              .map(({ value }) => value)
          : [],
      };
    }

    if (item.children) {
      updated.children = item.children.map((child) =>
        visit(child, path, enabled),
      );
    }
    return updated;
  };

  return items.map((item) => visit(item, "", true));
};

const permissionValues = (items: Item[]): unknown[] =>
  items.map((item) => [
    item.id,
    item.type === "boolean"
      ? item.enabled
      : item.type === "toggles"
        ? [...item.values].sort()
        : item.type === "select"
          ? item.value
          : null,
    item.children ? permissionValues(item.children) : null,
  ]);

export const matchesPermissionPreset = (
  items: Item[],
  presetId: PermissionPresetId,
): boolean =>
  items.length > 0 &&
  JSON.stringify(permissionValues(items)) ===
    JSON.stringify(permissionValues(applyPermissionPreset(items, presetId)));
