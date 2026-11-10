export const parseEnvBoolean = (value?: string): boolean | null => {
  const normalized = String(value ?? "")
    .toLowerCase()
    .trim();
  if (["1", "yes", "true", "on"].includes(normalized)) return true;
  if (["0", "no", "false", "off"].includes(normalized)) return false;
  return null;
};

export const isEnvTrue = (value: unknown): boolean => {
  return (
    value === true ||
    value === 1 ||
    (typeof value === "string" &&
      ["true", "yes", "on", "1"].includes(value.trim().toLowerCase()))
  );
};
