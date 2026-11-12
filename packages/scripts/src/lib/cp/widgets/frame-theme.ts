/** Embedded widgets follow the host CP theme, including changes while open. */
export const syncWidgetFrameTheme = (): (() => void) => {
  let parentRoot: HTMLElement;
  try {
    if (
      window.parent === window ||
      window.parent.location.origin !== window.location.origin ||
      !window.frameElement?.hasAttribute("data-freeform-widget-frame")
    ) {
      return () => {};
    }
    parentRoot = window.parent.document.documentElement;
  } catch {
    return () => {};
  }

  const sync = () => {
    const theme = parentRoot.getAttribute("data-theme");
    if (theme === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  };
  const observer = new MutationObserver(sync);
  const connect = () => {
    sync();
    observer.observe(parentRoot, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  };
  const disconnect = () => observer.disconnect();
  connect();
  window.addEventListener("pagehide", disconnect);
  window.addEventListener("pageshow", connect);

  return () => {
    disconnect();
    window.removeEventListener("pagehide", disconnect);
    window.removeEventListener("pageshow", connect);
  };
};
