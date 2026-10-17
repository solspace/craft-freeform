import {
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type Position = { x: number; y: number };

export function constrainWizardPosition(
  position: Position,
  rect: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  width: number,
  height: number,
): Position {
  return {
    x:
      position.x +
      Math.max(12 - rect.left, Math.min(0, width - 12 - rect.right)),
    y:
      position.y +
      Math.max(12 - rect.top, Math.min(0, height - 12 - rect.bottom)),
  };
}

export function useWizardPosition(
  dialog: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  alignment: "center" | "right" | "right-review" = "center",
) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const moveBy = useCallback(
    (dx: number, dy: number) => {
      const rect = dialog.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition((current) =>
        constrainWizardPosition(
          { x: current.x + dx, y: current.y + dy },
          {
            left: rect.left + dx,
            right: rect.right + dx,
            top: rect.top + dy,
            bottom: rect.bottom + dy,
          },
          window.innerWidth,
          window.innerHeight,
        ),
      );
    },
    [dialog],
  );
  useEffect(() => {
    if (!enabled) return;
    const clamp = () => moveBy(0, 0);
    const observer = new ResizeObserver(clamp);
    if (dialog.current) observer.observe(dialog.current);
    window.addEventListener("resize", clamp);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", clamp);
    };
  }, [dialog, enabled, moveBy]);
  useLayoutEffect(() => {
    const rect = dialog.current?.getBoundingClientRect();
    setPosition((current) => ({
      x:
        enabled && alignment !== "center" && rect
          ? current.x + window.innerWidth - 48 - rect.right
          : 0,
      y: 0,
    }));
    drag.current = null;
    setMoving(false);
  }, [dialog, enabled, alignment]);
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setMoving(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return {
    position,
    moving,
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (
        !enabled ||
        event.button !== 0 ||
        (event.target as HTMLElement).closest(
          "button, a, input, select, textarea",
        )
      )
        return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      setMoving(true);
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      if (!drag.current || drag.current.id !== event.pointerId) return;
      moveBy(event.clientX - drag.current.x, event.clientY - drag.current.y);
      drag.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    },
    onPointerUp: endDrag,
  };
}
