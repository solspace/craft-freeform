import type { ClassNameStrategy } from "../types.js";

export function joinClassNames(
  ...parts: Array<string | undefined | false | null>
): string | undefined {
  const value = parts
    .filter(
      (part): part is string => typeof part === "string" && part.trim() !== "",
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return value || undefined;
}

export function mergeClassNames(
  strategy: ClassNameStrategy,
  base: string | undefined,
  extra: string | undefined,
): string | undefined {
  if (!extra) {
    return base;
  }

  if (!base || strategy === "replace") {
    return extra;
  }

  return `${base} ${extra}`.trim();
}
