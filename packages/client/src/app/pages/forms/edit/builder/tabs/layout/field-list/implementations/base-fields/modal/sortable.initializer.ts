import type { FieldListRefs } from "@ff-client/types/groups";
import type { RefObject } from "react";
import Sortable from "sortablejs";
import { catalogTypes } from "../../../catalog/catalog.types";

const removeShortcut = (element: HTMLElement, refs: FieldListRefs): void => {
  if (catalogTypes.includes(element.dataset.id)) element.remove();
  else refs.unassigned.appendChild(element);
};

const onAdd = (event: Sortable.SortableEvent, refs: FieldListRefs): void => {
  const item = event.item;
  const type = item.dataset.id;
  const duplicates = Array.from(event.to.children).filter(
    (child) => (child as HTMLElement).dataset.id === type,
  );
  if (duplicates.length > 1) {
    item.remove();
    return;
  }
  if (event.to === refs.unassigned && catalogTypes.includes(type)) {
    item.remove();
    return;
  }
  if (event.to !== refs.hidden) {
    Array.from(refs.hidden?.children ?? [])
      .filter((child) => (child as HTMLElement).dataset.id === type)
      .forEach((child) => {
        child.remove();
      });
  }
};

type SortableOptions = { [key: string]: Sortable.Options };

const putCondition = (_to: Sortable, from: Sortable): boolean =>
  from.options.handle !== ".handle";

export const initializeSortable = (
  fieldListRefs: RefObject<FieldListRefs>,
): (() => void) => {
  const instances: Sortable[] = [];
  const initialize = (
    selector: keyof FieldListRefs,
    options?: Sortable.Options,
  ): void => {
    const createSortable = fieldListRefs.current[selector];
    if (createSortable) {
      instances.push(Sortable.create(createSortable as HTMLElement, options));
    }
  };

  const handleSortableInit = (): void => {
    const options: SortableOptions = {
      unassigned: {
        group: { name: "shared", put: putCondition },
        animation: 150,
        sort: false,
        onAdd: (event) => onAdd(event, fieldListRefs.current),
      },
      hidden: {
        group: { name: "shared", put: putCondition },
        animation: 150,
        sort: true,
        onAdd: (event) => onAdd(event, fieldListRefs.current),
        filter: ".field-item-remove",
        onFilter: (evt) => removeShortcut(evt.item, fieldListRefs.current),
      },
      groupWrapper: {
        handle: ".handle",
        filter: ".group-remove",
        sort: true,
        animation: 150,
        onFilter: (evt) => {
          const groupItems = Array.from(
            fieldListRefs.current[evt.item.dataset.id].children,
          );
          groupItems.forEach((item) => {
            removeShortcut(item as HTMLElement, fieldListRefs.current);
          });
          evt.item.remove();
        },
      },
    };

    Object.entries(options).forEach(([selector, option]) => {
      initialize(selector as keyof FieldListRefs, option);
    });
  };

  handleSortableInit();
  return () =>
    instances.forEach((instance) => {
      instance.destroy();
    });
};

export const initializeGroupedSortable = (
  el: HTMLDivElement | null,
  uid: string,
  fieldListRefs: RefObject<FieldListRefs>,
  catalog = false,
): void => {
  const previous = fieldListRefs.current[uid];
  if (previous && previous !== el) {
    Sortable.get(previous)?.destroy();
    delete fieldListRefs.current[uid];
  }
  if (el) {
    fieldListRefs.current[uid] = el;
    if (Sortable.get(el)) return;
    Sortable.create(el, {
      animation: 150,
      group: {
        name: `group-${uid}`,
        pull: catalog ? "clone" : true,
        put: catalog ? false : (_to, from) => from.options.handle !== ".handle",
      },
      sort: !catalog,
      onAdd: (event) => onAdd(event, fieldListRefs.current),
      filter: ".field-item-remove",
      onFilter: (evt) => {
        if (!catalog) removeShortcut(evt.item, fieldListRefs.current);
      },
    });
  }
};
