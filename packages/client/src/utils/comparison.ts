import cmp from "semver-compare";

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

export const createSemverCompare = (currentVersion: string): SemverCompare => {
  const compare: SemverCompare = (version) =>
    cmp(currentVersion, version) === 0;

  compare.atLeast = (version) => cmp(currentVersion, version) >= 0;
  compare.atMost = (version) => cmp(currentVersion, version) <= 0;
  compare.below = (version) => cmp(currentVersion, version) < 0;
  compare.above = (version) => cmp(currentVersion, version) > 0;

  return compare;
};
