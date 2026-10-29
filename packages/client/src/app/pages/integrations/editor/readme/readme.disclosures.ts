/** Animate native details without changing their keyboard or fallback behavior. */
export function animateReadmeDisclosures(container: HTMLElement): () => void {
  const cleanups = Array.from(container.querySelectorAll("details")).map(
    (details) => {
      const summary = details.querySelector(":scope > summary");
      if (!summary) return () => {};
      let animation: Animation | undefined;
      let expanding = false;
      const reset = () => {
        details.style.height = "";
        details.style.overflow = "";
        delete details.dataset.closing;
        animation = undefined;
      };
      const cancel = () => {
        if (animation) {
          animation.onfinish = null;
          animation.cancel();
        }
      };
      const toggle = (event: Event) => {
        if (
          typeof details.animate !== "function" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          (event.target instanceof Element &&
            event.target.closest("a, button, input"))
        ) {
          cancel();
          reset();
          return;
        }
        event.preventDefault();
        const from = details.getBoundingClientRect().height;
        const open = animation ? !expanding : !details.open;
        cancel();
        reset();
        details.open = open;
        const to = details.getBoundingClientRect().height;
        details.open = true;
        expanding = open;
        if (!open) details.dataset.closing = "true";
        details.style.overflow = "hidden";
        animation = details.animate(
          { height: [`${from}px`, `${to}px`] },
          { duration: 220, easing: "cubic-bezier(0.2, 0, 0, 1)" },
        );
        animation.onfinish = () => {
          details.open = open;
          reset();
        };
      };
      summary.addEventListener("click", toggle);
      return () => {
        summary.removeEventListener("click", toggle);
        cancel();
        reset();
      };
    },
  );
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
