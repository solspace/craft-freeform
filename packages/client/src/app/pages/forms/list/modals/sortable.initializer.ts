import type { FormGroupsListRefs } from "@ff-client/types/form-groups";
import type { RefObject } from "react";
import Sortable from "sortablejs";

export type FormGroupSortHandlers = {
  moveForm: (id: number, targetUid: string | null, index: number) => void;
  moveGroup: (uid: string, index: number) => void;
};

// Sortable moves the DOM first. Restore it before React renders the new state,
// so moving between React-owned lists does not leave stale or duplicate nodes.
const restoreItem = (event: Sortable.SortableEvent): void => {
  event.item.remove();
  event.from.insertBefore(
    event.item,
    event.from.children[event.oldIndex] || null,
  );
};

const clearDropTargets = (element: HTMLElement): void => {
  element
    .closest("[data-group-manager]")
    ?.querySelectorAll(".is-drop-target")
    .forEach((target) => {
      target.classList.remove("is-drop-target");
    });
};

const formOptions = (
  handlers: FormGroupSortHandlers,
  disabled: boolean,
): Sortable.Options => ({
  group: "form-group-manager-forms",
  draggable: ".form-group-item",
  filter: "button, input, select, a",
  preventOnFilter: false,
  animation: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 150,
  ghostClass: "is-drag-placeholder",
  chosenClass: "is-drag-chosen",
  disabled,
  emptyInsertThreshold: 24,
  onMove: (event) => {
    clearDropTargets(event.to);
    event.to.classList.add("is-drop-target");
  },
  onEnd: (event) => {
    const targetUid = event.to.dataset.groupUid || null;
    clearDropTargets(event.from);
    restoreItem(event);
    handlers.moveForm(
      Number(event.item.dataset.id),
      targetUid,
      event.newDraggableIndex ?? event.newIndex,
    );
  },
});

export const initializeSortable = (
  refs: RefObject<FormGroupsListRefs>,
  handlers: FormGroupSortHandlers,
  disabled: boolean,
): (() => void) => {
  const instances: Sortable[] = [];
  if (refs.current.unassigned)
    instances.push(
      Sortable.create(refs.current.unassigned, formOptions(handlers, disabled)),
    );
  if (refs.current.groupWrapper)
    instances.push(
      Sortable.create(refs.current.groupWrapper, {
        handle: ".group-handle",
        draggable: ".form-group",
        animation: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? 0
          : 150,
        ghostClass: "is-drag-placeholder",
        disabled,
        onEnd: (event) => {
          restoreItem(event);
          handlers.moveGroup(
            event.item.dataset.id,
            event.newDraggableIndex ?? event.newIndex,
          );
        },
      }),
    );
  return () => {
    instances.forEach((instance) => {
      instance.destroy();
    });
  };
};

export const initializeGroupedSortable = (
  element: HTMLDivElement | null,
  uid: string,
  refs: RefObject<FormGroupsListRefs>,
  handlers: FormGroupSortHandlers,
  disabled: boolean,
): void => {
  const previous = refs.current[uid];
  if (previous && previous !== element) Sortable.get(previous)?.destroy();
  if (!element) {
    delete refs.current[uid];
    return;
  }
  if (!Sortable.get(element))
    Sortable.create(element, formOptions(handlers, disabled));
  else Sortable.get(element).option("disabled", disabled);
  refs.current[uid] = element;
};
