import { Drag } from "@editor/builder/types/drag";
import { useEffect } from "react";
import { useDragDropManager } from "react-dnd";

/** Release React DnD too if the browser loses the native drag-end event. */
export function useDragRecovery(): void {
  const manager = useDragDropManager();

  useEffect(() => {
    const monitor = manager.getMonitor();
    let pending: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      clearTimeout(pending);
      pending = undefined;
      const type = monitor.getItemType();
      if (
        monitor.isDragging() &&
        (type === Drag.Field ||
          type === Drag.FieldType ||
          type === Drag.FavoriteField)
      ) {
        // Resetting only our context leaves the source dimmed and prevents
        // subsequent drags. End the actual drag without dispatching a drop.
        manager.getActions().endDrag();
      }
    };
    const finishAfterDrop = () => {
      clearTimeout(pending);
      // Native drop handlers must finish moving/adding the field first.
      pending = setTimeout(finish, 0);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };

    window.addEventListener("pointerdown", finish, true);
    window.addEventListener("mousedown", finish, true);
    window.addEventListener("mouseup", finishAfterDrop, true);
    window.addEventListener("dragend", finishAfterDrop, true);
    window.addEventListener("drop", finishAfterDrop, true);
    window.addEventListener("keydown", onEscape, true);
    window.addEventListener("keyup", onEscape, true);
    return () => {
      clearTimeout(pending);
      window.removeEventListener("pointerdown", finish, true);
      window.removeEventListener("mousedown", finish, true);
      window.removeEventListener("mouseup", finishAfterDrop, true);
      window.removeEventListener("dragend", finishAfterDrop, true);
      window.removeEventListener("drop", finishAfterDrop, true);
      window.removeEventListener("keydown", onEscape, true);
      window.removeEventListener("keyup", onEscape, true);
    };
  }, [manager]);
}
