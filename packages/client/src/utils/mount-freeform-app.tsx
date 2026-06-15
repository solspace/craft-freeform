import type { ReactNode } from "react";
import ReactDOM from "react-dom/client";

type CpGlobal = {
  booted: (callback: (cp: unknown) => void) => void;
};

const getCpGlobal = (): CpGlobal | undefined => {
  const cp = (window as Window & { Cp?: CpGlobal }).Cp;

  if (cp?.booted) {
    return cp;
  }

  return undefined;
};

const isAppMounted = (): boolean =>
  !!document.getElementById("freeform-client-app");

const getOrCreateMountContainer = (): HTMLElement | null => {
  const existing = document.getElementById("freeform-client");
  if (existing) {
    return existing;
  }

  const contentContainer =
    document.getElementById("content-container") ??
    document.querySelector<HTMLElement>("#main #content") ??
    document.getElementById("main");

  if (!contentContainer) {
    return null;
  }

  const container = document.createElement("div");
  container.id = "freeform-client";
  contentContainer.appendChild(container);

  return container;
};

export const mountFreeformApp = (renderTree: () => ReactNode): void => {
  let root: ReactDOM.Root | null = null;
  let container: HTMLElement | null = null;

  const mount = (): void => {
    if (isAppMounted()) {
      return;
    }

    const nextContainer = getOrCreateMountContainer();
    if (!nextContainer) {
      return;
    }

    if (container !== nextContainer) {
      root = null;
      container = nextContainer;
    }

    if (!root) {
      root = ReactDOM.createRoot(container);
    }

    root.render(renderTree());
  };

  const scheduleMount = (): void => {
    mount();

    if (isAppMounted()) {
      return;
    }

    for (const delay of [0, 50, 100, 250, 500, 1000, 2000]) {
      window.setTimeout(mount, delay);
    }
  };

  const registerWithCp = (cp: CpGlobal): void => {
    cp.booted(scheduleMount);
    scheduleMount();
  };

  const cp = getCpGlobal();

  if (cp) {
    registerWithCp(cp);
    return;
  }

  const interval = window.setInterval(() => {
    const craftCp = getCpGlobal();
    if (!craftCp) {
      return;
    }

    window.clearInterval(interval);
    registerWithCp(craftCp);
  }, 0);

  window.setTimeout(() => {
    window.clearInterval(interval);
    scheduleMount();
  }, 3000);
};
