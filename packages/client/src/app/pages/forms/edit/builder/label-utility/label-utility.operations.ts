import type { Page, Row } from "@editor/builder/types/layout";
import type { Field } from "@editor/store/slices/layout/fields";
import type { TranslationState } from "@editor/store/slices/translations/translations.types";
import type { FieldType } from "@ff-client/types/fields";

export type Capitalization = "keep" | "sentence" | "title" | "upper" | "lower";
export type ColonStyle = "keep" | "add" | "remove";
export type LabelSettings = {
  capitalization: Capitalization;
  colons: ColonStyle;
  locale?: string;
  find?: string;
  replacement?: string;
  matchCase?: boolean;
  cleanSpacing?: boolean;
  preserveAcronyms?: boolean;
};
export type LabelCandidate = {
  uid: string;
  label: string;
  handle: string;
  page: string;
  siteId?: number;
  typeClass: string;
};

const words = /\p{L}[\p{L}\p{M}\p{N}]*(?:['’][\p{L}\p{M}\p{N}]+)*/gu;
const commonAcronyms = new Set([
  "ID",
  "URL",
  "PDF",
  "ZIP",
  "API",
  "HTML",
  "CSS",
  "HTTP",
  "HTTPS",
  "IP",
  "SMS",
  "SSN",
  "DOB",
  "VAT",
  "GST",
  "HST",
  "PIN",
  "SKU",
  "UUID",
  "SQL",
  "JSON",
  "XML",
  "CSV",
  "PNG",
  "JPG",
  "JPEG",
  "GIF",
  "SVG",
  "USA",
  "US",
  "UK",
  "EU",
  "PO",
  "IT",
  "HR",
  "CV",
  "IBAN",
  "BIC",
  "SWIFT",
  "ISBN",
  "AI",
]);

export const formatLabel = (
  label: string,
  {
    capitalization,
    colons,
    locale,
    find,
    replacement = "",
    matchCase = false,
    cleanSpacing = false,
    preserveAcronyms = false,
  }: LabelSettings,
): string => {
  let result = label;
  if (find) {
    const pattern = new RegExp(
      find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      matchCase ? "gu" : "giu",
    );
    // Both sides are literal text: replacement strings such as $& are not substitutions.
    result = result.replace(pattern, () => replacement);
  }
  if (cleanSpacing) result = result.trim().replace(/\s+/gu, " ");
  const acronyms = new Map<string, string>(
    preserveAcronyms && ["sentence", "title"].includes(capitalization)
      ? (result.match(words) ?? [])
          .filter((word) => commonAcronyms.has(word.replace(/['’]s$/iu, "")))
          .map((word) => [word.toLocaleLowerCase(locale), word])
      : [],
  );
  if (capitalization !== "keep") {
    result =
      capitalization === "upper"
        ? result.toLocaleUpperCase(locale)
        : result.toLocaleLowerCase(locale);
    if (capitalization === "sentence")
      result = result.replace(/\p{L}/u, (letter) =>
        letter.toLocaleUpperCase(locale),
      );
    if (capitalization === "title")
      result = result.replace(words, (word) =>
        word.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase(locale)),
      );
    if (acronyms.size)
      result = result.replace(
        words,
        (word) => acronyms.get(word.toLocaleLowerCase(locale)) ?? word,
      );
  }
  if (colons === "remove") result = result.replace(/(?:\s*[:：])+\s*$/u, "");
  if (colons === "add") {
    result = result.trimEnd().replace(/(?:\s*[:：])+$/u, "");
    // Questions and exclamations already have their own ending punctuation.
    if (result.trim() && !/[?!？！]$/u.test(result)) result += ":";
  }
  return result;
};

export const collectLabels = ({
  fields,
  rows,
  pages,
  types,
  translations,
  siteId,
  pageUid,
}: {
  fields: Field[];
  rows: Row[];
  pages: Page[];
  types: FieldType[];
  translations: TranslationState;
  siteId?: number;
  pageUid?: string;
}): { candidates: LabelCandidate[]; skipped: number } => {
  const candidates: LabelCandidate[] = [];
  let skipped = 0;
  const visited = new Set<string>();
  const typesByClass = new Map(types.map((type) => [type.typeClass, type]));
  const rowsByLayout = new Map<string, Row[]>();
  const fieldsByRow = new Map<string, Field[]>();
  for (const row of rows)
    rowsByLayout.set(row.layoutUid, [
      ...(rowsByLayout.get(row.layoutUid) ?? []),
      row,
    ]);
  for (const field of fields)
    fieldsByRow.set(field.rowUid, [
      ...(fieldsByRow.get(field.rowUid) ?? []),
      field,
    ]);
  const visit = (layout: string, page: string) => {
    if (visited.has(layout)) return;
    visited.add(layout);
    for (const row of [...(rowsByLayout.get(layout) ?? [])].sort(
      (a, b) => a.order - b.order,
    )) {
      for (const field of [...(fieldsByRow.get(row.uid) ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      )) {
        const type = typesByClass.get(field.typeClass);
        const property = type?.properties.find(
          (item) => item.handle === "label",
        );
        const editable =
          property &&
          property.visible !== false &&
          !property.disabled &&
          !property.flags?.some((flag) =>
            ["readonly", "as-readonly-in-instance"].includes(flag),
          );
        if (
          type &&
          property &&
          editable &&
          // Checkbox labels render beside the input instead of in the field wrapper.
          (!type.implements.includes("noLabel") || type.type === "checkbox") &&
          ![
            "html",
            "rich-text",
            "hidden",
            "invisible",
            "layout",
            "layout-column",
          ].includes(type.type)
        ) {
          // Match normal property editing: non-translatable labels belong to the base form.
          const targetSite = property.translatable ? siteId : undefined;
          const translated =
            targetSite === undefined
              ? undefined
              : translations[targetSite]?.fields?.[field.uid]?.label;
          const label = translated ?? field.properties.label;
          if (typeof label === "string" && label.trim()) {
            if (
              /<[^>]*>|\{[{%#]|&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]+);/iu.test(
                label,
              )
            )
              skipped++;
            else
              candidates.push({
                uid: field.uid,
                label,
                handle: field.properties.handle ?? "",
                page,
                siteId: targetSite,
                typeClass: field.typeClass,
              });
          }
        }
        if (
          ["group", "layout", "layout-column"].includes(type?.type) &&
          typeof field.properties.layout === "string"
        )
          visit(field.properties.layout, page);
      }
    }
  };
  for (const page of [...pages].sort((a, b) => a.order - b.order)) {
    if (!pageUid || page.uid === pageUid) visit(page.layoutUid, page.label);
  }
  return { candidates, skipped };
};
