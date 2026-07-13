import type { ClassNameStrategy } from "../types.js";

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
