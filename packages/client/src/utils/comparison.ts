export const objectHasAnyKey = (
  object: Record<string, unknown>,
  keys: string[]
): boolean => {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(object, key));
};
