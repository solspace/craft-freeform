import type { Field } from ".";

/** Handles share one namespace across every page and nested layout. */
export const uniqueFieldHandle = (
  fields: readonly Pick<Field, "uid" | "properties">[],
  preferred: string,
  excludeUid?: string,
): string => {
  const used = new Set(
    fields
      .filter((field) => field.uid !== excludeUid)
      .map((field) => String(field.properties.handle ?? "").toLowerCase()),
  );
  const stem = preferred || "field";
  let candidate = stem;
  let suffix = 1;
  while (used.has(candidate.toLowerCase())) candidate = `${stem}_${suffix++}`;
  return candidate;
};
