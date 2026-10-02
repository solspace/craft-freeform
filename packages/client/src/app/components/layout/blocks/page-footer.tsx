import { useLayoutEffect, useRef } from "react";

/** Keep Craft's trial notice above the save row, within its sticky boundary. */
export const PageFooter = () => {
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const footer = document.querySelector<HTMLElement>("#global-footer");
    const parent = footer?.parentElement;
    if (!footer || !parent || !container.current) return;
    const next = footer.nextSibling;
    container.current.append(footer);
    return () => {
      parent.insertBefore(footer, next?.parentNode === parent ? next : null);
    };
  }, []);

  return <div className="freeform-footer-notices" ref={container} />;
};
