export const isEnvTrue = (value: unknown): boolean => {
  return (
    value === true ||
    value === 1 ||
    (typeof value === "string" &&
      ["true", "yes", "on", "1"].includes(value.trim().toLowerCase()))
  );
};
