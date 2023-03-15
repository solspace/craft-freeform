export const hasErrors = (ref: object | undefined): boolean => {
  if (!ref) {
    return false;
  }

  return Boolean(Object.entries(ref).length);
};
