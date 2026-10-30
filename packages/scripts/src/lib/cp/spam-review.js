/** Bind the quick review controls without submitting or selecting the table row. */
export function bindSpamReviewActions(container, options) {
  const { request, refresh, notify, translate } = options;
  const cleanups = [];

  for (const group of container.querySelectorAll("[data-spam-review-id]")) {
    let pending = false;
    let disposed = false;
    const buttons = [...group.querySelectorAll("button")];
    const stopPropagation = (event) => event.stopPropagation();
    const onClick = async (event) => {
      event.stopPropagation();
      const button = event.target.closest("[data-spam-operation]");
      const operation = button?.dataset.spamOperation;
      if (!button || !["approve", "delete"].includes(operation)) return;
      event.preventDefault();
      if (pending || disposed) return;

      const focus = group.contains(document.activeElement);
      const row = group.closest("tr");
      const nextGroup = (
        row?.nextElementSibling || row?.previousElementSibling
      )?.querySelector("[data-spam-review-id]");
      pending = true;
      group.setAttribute("aria-busy", "true");
      for (const control of buttons) control.disabled = true;
      try {
        await request(Number(group.dataset.spamReviewId), operation);
      } catch {
        notify(
          "error",
          translate(
            operation === "approve"
              ? "Could not approve submission."
              : "Could not delete submission.",
          ),
        );
        pending = false;
        group.removeAttribute("aria-busy");
        for (const control of buttons) control.disabled = false;
        if (focus && !disposed) button.focus();
        return;
      }

      notify(
        "success",
        translate(
          operation === "approve"
            ? "Submission approved."
            : "Submission deleted.",
        ),
      );
      // Keep completed controls disabled if the refresh fails, so approval cannot run twice.
      try {
        await refresh({ focus, nextId: nextGroup?.dataset.spamReviewId });
      } catch {
        notify(
          "error",
          translate(
            "Submission updated, but the list could not be refreshed. Reload the page to see the latest submissions.",
          ),
        );
      } finally {
        group.removeAttribute("aria-busy");
      }
    };
    group.addEventListener("click", onClick);
    for (const event of ["mousedown", "dblclick", "keydown", "keyup"]) {
      group.addEventListener(event, stopPropagation);
    }
    cleanups.push(() => {
      disposed = true;
      group.removeEventListener("click", onClick);
      for (const event of ["mousedown", "dblclick", "keydown", "keyup"]) {
        group.removeEventListener(event, stopPropagation);
      }
    });
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
