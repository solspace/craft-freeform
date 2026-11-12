import type { CSSProperties, RefObject } from "react";
import { useLayoutEffect, useState } from "react";

export function dropdownPosition(
  anchor: Pick<DOMRect, "left" | "top" | "bottom" | "width">,
  menuHeight: number,
  viewport: { width: number; height: number },
): CSSProperties {
  const gutter = 8;
  const width = Math.min(
    Math.max(anchor.width, 240),
    360,
    viewport.width - gutter * 2,
  );
  const height = Math.min(menuHeight, viewport.height - gutter * 2);
  const below = anchor.bottom + 4;
  const above = anchor.top - height - 4;
  const top =
    below + height > viewport.height - gutter && above >= gutter
      ? above
      : below;
  return {
    position: "fixed",
    width,
    left: Math.max(
      gutter,
      Math.min(anchor.left, viewport.width - width - gutter),
    ),
    top: Math.max(gutter, Math.min(top, viewport.height - height - gutter)),
  };
}

export function useDropdownPosition(
  anchor: RefObject<HTMLDivElement | null>,
  menu: RefObject<HTMLDivElement | null>,
  open: boolean,
): CSSProperties {
  const [position, setPosition] = useState<CSSProperties>({
    position: "fixed",
  });
  useLayoutEffect(() => {
    if (!open || !anchor.current || !menu.current) return;
    const update = (): void => {
      const next = dropdownPosition(
        anchor.current!.getBoundingClientRect(),
        menu.current!.offsetHeight,
        {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      );
      setPosition((previous) =>
        previous.top === next.top &&
        previous.left === next.left &&
        previous.width === next.width
          ? previous
          : next,
      );
    };
    update();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(update);
    observer?.observe(anchor.current);
    observer?.observe(menu.current);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor, menu, open]);
  return position;
}
