import translate from "@ff-client/utils/translations";

export function wireReadmeCopyButtons(container: HTMLElement): () => void {
  const timers = new Map<HTMLButtonElement, number>();
  let disposed = false;
  const copy = async (button: HTMLButtonElement) => {
    const block = button.closest(".readme-code-block");
    const code = block?.querySelector("pre code");
    const label = button.querySelector(".readme-copy-label");
    const status = block?.querySelector(".readme-copy-status");
    if (!code || !label || !status || button.disabled) return;
    window.clearTimeout(timers.get(button));
    status.textContent = "";
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(code.textContent ?? "");
      if (disposed) return;
      label.textContent = translate("Copied");
      button.dataset.copied = "true";
      timers.set(
        button,
        window.setTimeout(() => {
          label.textContent = translate("Copy code");
          delete button.dataset.copied;
          timers.delete(button);
        }, 2000),
      );
    } catch {
      if (disposed) return;
      label.textContent = translate("Copy code");
      delete button.dataset.copied;
      status.textContent = translate(
        "Could not copy automatically. Select and copy the code above.",
      );
    } finally {
      if (!disposed) button.disabled = false;
    }
  };
  const onClick = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const button =
      event.target.closest<HTMLButtonElement>("button.readme-copy");
    if (button && container.contains(button)) void copy(button);
  };
  container.addEventListener("click", onClick);
  return () => {
    disposed = true;
    container.removeEventListener("click", onClick);
    for (const timer of timers.values()) window.clearTimeout(timer);
  };
}
