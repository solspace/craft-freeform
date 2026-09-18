import type {
  FreeformManifest,
  ManifestFieldDefinition,
} from "../types/manifest.js";

export type SummaryConfig = {
  fields?: string[];
  hideEmpty?: boolean;
  emptyValue?: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  filesLabel?: string;
};

export type SummarySource = {
  handle: string;
  type: string;
  label: string;
  options?: Array<{ value: string; label: string }>;
  columns?: Array<{
    type: string;
    label: string;
    options?: Array<string | { value: string; label: string }>;
  }>;
};

export type SummaryEntry = { handle: string; label: string; text: string };

// Keep in sync with the PHP SummaryFormatter allowlist. Unknown types are private.
const supportedTypes = new Set([
  "text",
  "textarea",
  "email",
  "number",
  "phone",
  "website",
  "regex",
  "dropdown",
  "multiple-select",
  "checkbox",
  "checkboxes",
  "radios",
  "datetime",
  "rating",
  "opinion-scale",
  "cards",
  "calculation",
  "file",
  "file-dnd",
  "table",
]);

export function supportsSummary(type: string): boolean {
  return supportedTypes.has(type);
}

/** Plain text only: renderers must use text nodes, never HTML interpolation. */
export function formatSummaryValue(
  source: Pick<SummarySource, "type" | "options" | "columns">,
  value: unknown,
  config: SummaryConfig,
): string {
  if (source.type === "checkbox") {
    const checked =
      value !== null &&
      value !== undefined &&
      value !== false &&
      value !== "" &&
      value !== 0 &&
      value !== "0";
    return checked
      ? (config.checkedLabel ?? "Yes")
      : config.hideEmpty !== false
        ? ""
        : (config.uncheckedLabel ?? "No");
  }
  if (source.type === "file" || source.type === "file-dnd") {
    const count = Array.isArray(value)
      ? value.filter(Boolean).length
      : value
        ? 1
        : 0;
    return count ? `${config.filesLabel ?? "Files"}: ${count}` : "";
  }
  if (source.type === "table") {
    if (!Array.isArray(value)) return "";
    return value
      .filter(Array.isArray)
      .map((row) =>
        (source.columns ?? [])
          .map((column, index) => {
            const options = column.options?.map((option) =>
              typeof option === "string"
                ? { value: option, label: option }
                : option,
            );
            const text = formatSummaryValue(
              { ...column, options },
              row[index],
              config,
            );
            return text ? `${column.label}: ${text}` : "";
          })
          .filter(Boolean)
          .join("; "),
      )
      .filter(Boolean)
      .join("\n");
  }
  return (Array.isArray(value) ? value : [value])
    .filter(
      (item) =>
        typeof item === "string" || typeof item === "number" || item === true,
    )
    .map((item) => String(item === true ? 1 : item))
    .filter((item) => item !== "")
    .map(
      (item) =>
        source.options?.find((option) => String(option.value) === item)
          ?.label ?? item,
    )
    .join(", ");
}

export function getSummaryEntries(
  summary: ManifestFieldDefinition,
  form: {
    manifest: FreeformManifest;
    values: Record<string, unknown>;
    isFieldVisible: (handle: string) => boolean;
  },
): SummaryEntry[] {
  const config = (summary.frontend?.config ?? {}) as SummaryConfig;
  const entries: SummaryEntry[] = [];
  const parents = new Map<string, string>();
  for (const field of Object.values(form.manifest.fields)) {
    for (const row of field.layout?.rows ?? []) {
      for (const handle of row.fields) parents.set(handle, field.handle);
    }
  }
  const visible = (handle: string): boolean => {
    const visited = new Set<string>();
    let current: string | undefined = handle;
    while (current) {
      if (
        visited.has(current) ||
        !form.isFieldVisible(current) ||
        form.manifest.context?.hiddenFields?.includes(current)
      )
        return false;
      visited.add(current);
      current = parents.get(current);
    }
    return true;
  };

  for (const handle of config.fields ?? []) {
    const field = form.manifest.fields[handle];
    if (!field || !supportsSummary(field.type) || !visible(handle)) continue;
    const frontend = field.frontend?.config ?? {};
    if (field.type === "calculation" && frontend.inputType === "hidden")
      continue;
    const source: SummarySource = {
      handle,
      type: field.type,
      label: field.label,
      options:
        field.type === "cards"
          ? (frontend.cards as SummarySource["options"])
          : field.options,
      columns: frontend.columns as SummarySource["columns"],
    };
    const text = formatSummaryValue(source, form.values[handle], config);
    if (config.hideEmpty !== false && text === "") continue;
    entries.push({
      handle,
      label: field.label.replace(/<[^>]*>/g, ""),
      text: text === "" ? (config.emptyValue ?? "Not answered") : text,
    });
  }
  return entries;
}
