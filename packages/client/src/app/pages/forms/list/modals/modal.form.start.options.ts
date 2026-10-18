export type FormCreationMethod = "wizard" | "ai" | "blank";

export function formCreationMethods(
  configured?: readonly string[],
  edition = "pro",
): FormCreationMethod[] {
  const methods: FormCreationMethod[] = ["wizard", "ai", "blank"];
  const available = methods.filter(
    (method) => method !== "ai" || edition === "pro",
  );
  const selected =
    configured === undefined
      ? available
      : available.filter((method) => configured.includes(method));
  // A downgrade must not leave sites configured for AI alone unable to add forms.
  return !selected.length && edition !== "pro" && configured?.includes("ai")
    ? available
    : selected;
}
