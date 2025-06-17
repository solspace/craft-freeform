export const objectHasAnyKey = (
  object: Record<string, unknown>,
  keys: string[]
): boolean => {
  if (!object || typeof object !== 'object' || !Array.isArray(keys)) {
    return false;
  }

  return keys.some((key) => Object.prototype.hasOwnProperty.call(object, key));
};
