// Keep the bare-domain pattern in sync with WebsiteField::normalizeValue().
const bareWebsite =
  /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,15}(?:[/?#][^\s]*)?$/i;

/** Complete a recognizable website without rewriting an explicitly entered scheme. */
export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  const bare = trimmed.startsWith("//") ? trimmed.slice(2) : trimmed;
  return bareWebsite.test(bare) ? `https://${bare}` : trimmed;
}

/** Shared behavior for classic forms and the React/Vue built-in renderers. */
export function mountWebsite(
  input: HTMLInputElement,
  onNormalize?: (value: string) => void,
) {
  const form = input.form;
  let ownsError = false;
  const clearError = () => {
    if (ownsError) input.setCustomValidity("");
    ownsError = false;
  };
  const normalize = () => {
    if (input.matches(":disabled") || input.readOnly) return;
    const value = normalizeWebsite(input.value);
    clearError();
    if (value === input.value) return;
    input.value = value;
    onNormalize?.(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    // Classic text-field conditional rules also listen for keyup.
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  };
  const invalid = () => {
    if (input.validity.typeMismatch && !input.validity.customError) {
      input.setCustomValidity(
        input.dataset.websiteError ??
          "Enter a website address, like example.com.",
      );
      ownsError = true;
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      !event.isComposing &&
      event.target instanceof HTMLInputElement
    )
      normalize();
  };
  const click = (event: MouseEvent) => {
    const button = (event.target as Element).closest?.("button, input");
    if (
      (button instanceof HTMLButtonElement ||
        button instanceof HTMLInputElement) &&
      button.form === form &&
      (button.type === "submit" || button.type === "image")
    )
      normalize();
  };

  input.addEventListener("blur", normalize);
  input.addEventListener("change", normalize);
  input.addEventListener("input", clearError);
  input.addEventListener("invalid", invalid);
  form?.addEventListener("keydown", keydown, true);
  form?.addEventListener("click", click, true);
  form?.addEventListener("submit", normalize, true);
  form?.addEventListener("reset", clearError);

  return {
    clear: clearError,
    destroy() {
      clearError();
      input.removeEventListener("blur", normalize);
      input.removeEventListener("change", normalize);
      input.removeEventListener("input", clearError);
      input.removeEventListener("invalid", invalid);
      form?.removeEventListener("keydown", keydown, true);
      form?.removeEventListener("click", click, true);
      form?.removeEventListener("submit", normalize, true);
      form?.removeEventListener("reset", clearError);
    },
  };
}
