import { useEventCallback } from "@ff-client/hooks/ts-hooks/use-event-callback";
import { useEffect, useState } from "react";

/** Keep the wizard's backdrop until the hydrated, saved builder is on screen. */
export function useWizardHandoff(
  complete: { id: number } | undefined,
  navigate: (path: string) => void,
  close: () => void,
) {
  const [phase, setPhase] = useState<"loading" | "revealing" | "failed">(
    "loading",
  );
  const go = useEventCallback(navigate);
  const finish = useEventCallback(close);
  useEffect(() => {
    if (!complete) return;
    setPhase("loading");
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const started = performance.now();
    let revealTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let ready = false;
    const check = () => {
      if (
        ready ||
        !document.querySelector(
          `#freeform-client-app [data-form-builder-id="${complete.id}"]`,
        )
      )
        return;
      ready = true;
      observer.disconnect();
      clearTimeout(timeout);
      revealTimer = setTimeout(
        () => {
          frame = requestAnimationFrame(() => {
            setPhase("revealing");
            closeTimer = setTimeout(finish, reducedMotion ? 0 : 650);
          });
        },
        reducedMotion ? 0 : Math.max(0, 700 - (performance.now() - started)),
      );
    };
    const observer = new MutationObserver(check);
    observer.observe(
      document.getElementById("freeform-client-app") || document.body,
      {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-form-builder-id"],
      },
    );
    const timeout = setTimeout(() => {
      observer.disconnect();
      setPhase("failed");
    }, 15000);
    go(`/forms/${complete.id}`);
    check();
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      clearTimeout(revealTimer);
      clearTimeout(closeTimer);
      cancelAnimationFrame(frame);
    };
  }, [complete, go, finish]);
  return phase;
}
