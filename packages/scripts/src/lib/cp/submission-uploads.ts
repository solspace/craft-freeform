export function mountSubmissionUploads(root: ParentNode): void {
  for (const field of root.querySelectorAll<HTMLElement>(
    "[data-submission-upload]",
  )) {
    if (field.dataset.uploadMounted) continue;
    const input = field.querySelector<HTMLInputElement>("[data-upload-input]");
    const choose = field.querySelector<HTMLButtonElement>(
      "[data-upload-choose]",
    );
    const clear = field.querySelector<HTMLButtonElement>("[data-upload-clear]");
    const pending = field.querySelector<HTMLElement>("[data-upload-pending]");
    const filenames = field.querySelector<HTMLElement>(
      "[data-upload-filenames]",
    );
    if (!input || !choose || !clear || !pending || !filenames) continue;
    field.dataset.uploadMounted = "true";
    // Keep the native input available to assistive technology and as a no-JS fallback.
    input.classList.add("visually-hidden");
    input.tabIndex = -1;
    choose.hidden = false;
    choose.addEventListener("click", () => input.click());

    const update = () => {
      filenames.replaceChildren();
      for (const file of Array.from(input.files ?? [])) {
        const item = document.createElement("li");
        item.textContent = file.name;
        filenames.append(item);
      }
      pending.hidden = clear.hidden = !input.files?.length;
    };
    input.addEventListener("change", update);
    clear.addEventListener("click", () => {
      input.value = "";
      input.dispatchEvent(new Event("change", { bubbles: true }));
      choose.focus();
    });
    field.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const remove = target.closest<HTMLButtonElement>("[data-upload-remove]");
      if (!remove || !field.contains(remove)) return;
      if (!window.confirm(field.dataset.removeConfirm)) return;
      remove.closest(".element")?.remove();
      const empty = field.querySelector<HTMLElement>("[data-upload-empty]");
      if (empty) empty.hidden = !!field.querySelector(".file-preview .element");
      choose.focus();
    });
    input.form?.addEventListener("reset", () => queueMicrotask(update));
    update();
  }
}
