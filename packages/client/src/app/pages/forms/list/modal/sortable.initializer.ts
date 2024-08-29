import type { FormGroupsListRefs } from '@ff-client/types/form-groups';
import Sortable from 'sortablejs';

type SortableOptions = { [key: string]: Sortable.Options };

const putCondition = (to: Sortable, from: Sortable): boolean =>
  from.options.handle === '.handle' ? false : true;

export const initializeSortable = (
  formListRefs: React.MutableRefObject<FormGroupsListRefs>
): void => {
  const initialize = (
    selector: keyof FormGroupsListRefs,
    options?: Sortable.Options
  ): void => {
    const createSortable = formListRefs.current[selector];
    if (createSortable) Sortable.create(createSortable as HTMLElement, options);
  };

  const handleSortableInit = (): void => {
    const options: SortableOptions = {
      unassigned: {
        group: { name: 'shared', put: putCondition },
        animation: 150,
        sort: false,
      },
      groupWrapper: {
        handle: '.handle',
        filter: '.group-remove',
        sort: true,
        animation: 150,
        onFilter: (evt) => {
          const groupItems = Array.from(
            formListRefs.current[evt.item.dataset.id].children
          );
          formListRefs.current.unassigned.append(...groupItems);
          evt.item.remove();
        },
      },
    };

    Object.entries(options).forEach(([selector, option]) =>
      initialize(selector as keyof FormGroupsListRefs, option)
    );
  };

  handleSortableInit();
};

export const initializeGroupedSortable = (
  el: HTMLDivElement | null,
  uid: string,
  formGroupsListRefs: React.MutableRefObject<FormGroupsListRefs>
): void => {
  if (el) {
    Sortable.create(el, {
      animation: 150,
      group: {
        name: `group-${uid}`,
        put: (to, from) => (from.options.handle === '.handle' ? false : true),
      },
      sort: true,
      filter: '.form-item-remove',
      onFilter: (evt) =>
        formGroupsListRefs.current.unassigned.appendChild(evt.item),
    });
    formGroupsListRefs.current[uid] = el;
  }
};
