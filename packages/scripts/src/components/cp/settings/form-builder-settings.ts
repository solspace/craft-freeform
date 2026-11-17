const initializedLocks = new WeakSet<HTMLButtonElement>();

function revealDefaults(target: EventTarget | null): void {
  if (!(target instanceof Element)) return;
  for (
    let section = target.closest<HTMLDetailsElement>("[data-defaults-section]");
    section;
    section = section.parentElement?.closest<HTMLDetailsElement>(
      "[data-defaults-section]",
    )
  ) {
    section.open = true;
  }
}

export function initializeFormBuilderSettings(
  root: ParentNode = document,
): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-default-lock]",
  )) {
    if (initializedLocks.has(button)) continue;
    const input = button.querySelector<HTMLInputElement>(
      'input[type="hidden"]',
    );
    if (!input) continue;
    initializedLocks.add(button);
    const update = (): void => {
      const locked = input.value === "1";
      const label =
        (locked ? button.dataset.unlockLabel : button.dataset.lockLabel) ?? "";
      button.title = label;
      button.setAttribute("aria-label", label);
      button.classList.toggle("locked", locked);
      input.classList.toggle("locked", locked);
    };
    button.addEventListener("click", () => {
      input.value = input.value === "1" ? "0" : "1";
      update();
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    button
      .closest("form")
      ?.addEventListener("reset", () => queueMicrotask(update));
    update();
  }

  const methods = root.querySelector<HTMLElement>(
    "[data-form-creation-methods]",
  );
  const ai = root.querySelector<HTMLElement>("[data-form-creation-ai]");
  if (methods && ai) {
    const update = (): void => {
      const checkbox = methods.querySelector<HTMLInputElement>(
        'input[type="checkbox"][value="ai"]',
      );
      const native = methods.querySelector<HTMLElement & { checked?: boolean }>(
        'craft-checkbox[value="ai"]',
      );
      ai.hidden = !(checkbox?.checked ?? native?.checked ?? false);
    };
    methods.addEventListener("change", update);
    methods
      .closest("form")
      ?.addEventListener("reset", () => queueMicrotask(update));
    // Hiding this preference must not disable its input or discard the saved choice.
    update();
  }

  for (const section of root.querySelectorAll<HTMLDetailsElement>(
    "[data-defaults-section]",
  )) {
    if (
      section.querySelector(
        '[aria-invalid="true"], [invalid], .error:not(:empty)',
      )
    )
      section.open = true;
    section.addEventListener(
      "invalid",
      (event) => revealDefaults(event.target),
      true,
    );
    section.addEventListener("focusin", (event) => {
      const target = event.target;
      if (target instanceof Element && !target.closest("summary"))
        revealDefaults(target);
    });
  }
}
