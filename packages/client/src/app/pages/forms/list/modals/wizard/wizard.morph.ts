import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

/** Animate layout changes after positioning has settled, while leaving dragging direct. */
export function useWizardMorph(
  dialog: RefObject<HTMLDivElement | null>,
  mode: string,
) {
  const previous = useRef<DOMRect | undefined>(undefined);
  const pending = useRef(false);
  const animation = useRef<Animation | undefined>(undefined);
  useEffect(() => {
    const element = dialog.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const remember = () => {
      if (!pending.current && !animation.current)
        previous.current = element.getBoundingClientRect();
    };
    const observer = new ResizeObserver(remember);
    observer.observe(element);
    // A dragged modal changes position without changing its size.
    element.addEventListener("pointerup", remember);
    return () => {
      observer.disconnect();
      element.removeEventListener("pointerup", remember);
    };
  }, [dialog]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A mode change is the layout transition trigger.
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const before = previous.current;
    animation.current?.cancel();
    animation.current = undefined;
    pending.current = true;
    const frame = requestAnimationFrame(() => {
      pending.current = false;
      const after = element.getBoundingClientRect();
      previous.current = after;
      if (
        !before ||
        !after.width ||
        !after.height ||
        typeof element.animate !== "function" ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const motion = element.animate(
        [
          {
            transformOrigin: "top left",
            transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
          },
          {
            transformOrigin: "top left",
            transform: "translate(0, 0) scale(1, 1)",
          },
        ],
        { duration: 460, easing: "cubic-bezier(.22,.7,.22,1)" },
      );
      animation.current = motion;
      motion.finished
        .then(() => {
          if (animation.current === motion) animation.current = undefined;
        })
        .catch(() => {});
    });
    return () => {
      cancelAnimationFrame(frame);
      pending.current = false;
      animation.current?.cancel();
      animation.current = undefined;
    };
  }, [dialog, mode]);
}
