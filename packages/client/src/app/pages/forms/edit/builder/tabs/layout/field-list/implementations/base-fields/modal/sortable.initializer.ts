import type { FieldListRefs, Group } from '@ff-client/types/groups';
import Sortable from 'sortablejs';

type SortableOptions = {
  [key: string]: Sortable.Options;
};

const initializeSortable = (
  fieldListRefs: React.MutableRefObject<FieldListRefs>,
  state: Group
): void => {
  const initialize = (selector: string, options?: Sortable.Options): void => {
    if (fieldListRefs.current[selector]) {
      Sortable.create(fieldListRefs.current[selector], options);
    }
  };

  const handleSortableInit = (): void => {
    const options: SortableOptions = {
      unassigned: {
        group: { name: 'shared-list-unassigned', put: true },
        sort: false,
      },
      hidden: { group: { name: 'shared-list-hidden', put: true }, sort: true },
    };

    state.groups?.grouped.forEach((group) => {
      options[group.uid] = {
        group: { name: `shared-list-group-items-${group.uid}`, put: true },
        sort: true,
      };
    });

    options['groupWrapper'] = { handle: '.handle', sort: true };

    Object.entries(options).forEach(([selector, option]) => {
      initialize(selector, option);
    });
  };

  handleSortableInit();
};

export default initializeSortable;
