export const objectHasAnyKey = (
  object: Record<string, unknown>,
  keys: string[],
): boolean => {
  if (!object || typeof object !== "object" || !Array.isArray(keys)) {
    return false;
  }

  return keys.some((key) => Object.hasOwn(object, key));
};

type Comparison = (version: string) => boolean;

export type SemverCompare = {
  (version: string): boolean;
  atLeast: Comparison;
  atMost: Comparison;
  below: Comparison;
  above: Comparison;
};

const compareSemver = (left: string, right: string): number => {
  const a = left.split(".").map((part) => Number.parseInt(part, 10));
  const b = right.split(".").map((part) => Number.parseInt(part, 10));
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) {
      return diff > 0 ? 1 : -1;
    }
  }

  return 0;
};

export const createSemverCompare = (currentVersion: string): SemverCompare => {
  const compare: SemverCompare = (version) =>
    compareSemver(currentVersion, version) === 0;

  compare.atLeast = (version) => compareSemver(currentVersion, version) >= 0;
  compare.atMost = (version) => compareSemver(currentVersion, version) <= 0;
  compare.below = (version) => compareSemver(currentVersion, version) < 0;
  compare.above = (version) => compareSemver(currentVersion, version) > 0;

  return compare;
};
