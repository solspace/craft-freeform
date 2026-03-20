import type { FieldListRefs } from "@ff-client/types/groups";
import type { RefObject } from "react";
import Sortable from "sortablejs";

type SortableOptions = { [key: string]: Sortable.Options };

const putCondition = (_to: Sortable, from: Sortable): boolean =>
  from.options.handle !== ".handle";

export const initializeSortable = (
  fieldListRefs: RefObject<FieldListRefs>,
): void => {
  const initialize = (
    selector: keyof FieldListRefs,
    options?: Sortable.Options,
  ): void => {
    const createSortable = fieldListRefs.current[selector];
    if (createSortable) Sortable.create(createSortable as HTMLElement, options);
  };

  const handleSortableInit = (): void => {
    const options: SortableOptions = {
      unassigned: {
        group: { name: "shared", put: putCondition },
        animation: 150,
        sort: false,
      },
      hidden: {
        group: { name: "shared", put: putCondition },
        animation: 150,
        sort: true,
        filter: ".field-item-remove",
        onFilter: (evt) =>
          fieldListRefs.current.unassigned.appendChild(evt.item),
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
          fieldListRefs.current.unassigned.append(...groupItems);
          evt.item.remove();
        },
      },
    };

    Object.entries(options).forEach(([selector, option]) => {
      initialize(selector as keyof FieldListRefs, option);
    });
  };

  handleSortableInit();
};

export const initializeGroupedSortable = (
  el: HTMLDivElement | null,
  uid: string,
  fieldListRefs: RefObject<FieldListRefs>,
): void => {
  if (el) {
    Sortable.create(el, {
      animation: 150,
      group: {
        name: `group-${uid}`,
        put: (_to, from) => from.options.handle !== ".handle",
      },
      sort: true,
      filter: ".field-item-remove",
      onFilter: (evt) => fieldListRefs.current.unassigned.appendChild(evt.item),
    });
    fieldListRefs.current[uid] = el;
  }
};
