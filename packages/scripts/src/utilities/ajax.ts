export const csrfPaylaod = (payload: Record<string, unknown> = {}) => {
  const name = Craft.csrfTokenName;
  const token = Craft.csrfTokenValue;

  return {
    ...payload,
    [name]: token,
  };
};
