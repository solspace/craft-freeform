import type { ReactNode } from "react";
import ReactDOM from "react-dom/client";

/** Keep the React root attached to the current Craft screen fragment. */
export const mountFreeformApp = (renderTree: () => ReactNode): (() => void) => {
  let root: ReactDOM.Root | null = null;
  let container: HTMLElement | null = null;

  const unmount = (): void => {
    const previous = root;
    root = null;
    container = null;
    previous?.unmount();
  };

  const mount = (): void => {
    const nextContainer = document.getElementById("freeform-client");
    if (container === nextContainer) return;

    // Inertia can replace the fragment on history navigation without evaluating
    // an already-imported module again. Dispose portals and listeners as well.
    unmount();
    if (!nextContainer) return;

    container = nextContainer;
    root = ReactDOM.createRoot(container);
    root.render(renderTree());
  };

  const observer = new MutationObserver(mount);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  mount();

  return () => {
    observer.disconnect();
    unmount();
  };
};
