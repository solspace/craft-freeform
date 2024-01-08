import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import type { FieldListRefs, Group, GroupItem } from '@ff-client/types/groups';
import Sortable from 'sortablejs';
import { v4 } from 'uuid';

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type GroupOperations = {
  addGroup: () => void;
  updateGroupInfo: (
    property: 'label' | 'color',
    value: string,
    groupUid: string
  ) => void;
  syncFromRefs: () => GroupItem;
};

export const useGroupOperations = (
  initialState: Group,
  setState: StateSetter<Group>,
  fieldListRefs: React.MutableRefObject<FieldListRefs>
): GroupOperations => {
  const generateRandomColor = (): string =>
    `#${(Math.floor(Math.random() * 0xffffff) + 0x1000000)
      .toString(16)
      .slice(1)}`;

  const addGroup = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      groups: {
        ...prevState.groups,
        grouped: [
          ...prevState.groups.grouped,
          {
            uid: v4(),
            label: '',
            color: generateRandomColor(),
            types: [],
          },
        ],
      },
    }));
  }, [setState]);

  const updateGroupInfo = useCallback(
    (property: 'label' | 'color', value: string, groupUid: string) => {
      setState((prevState) => ({
        ...prevState,
        groups: {
          ...prevState.groups,
          grouped: prevState.groups.grouped.map((group) =>
            group.uid === groupUid ? { ...group, [property]: value } : group
          ),
        },
      }));
    },
    [setState]
  );

  const syncFromRefs = useCallback(() => {
    const hidden = Sortable.get(fieldListRefs.current.hidden).toArray();
    const groups = Sortable.get(fieldListRefs.current.groupWrapper).toArray();

    const grouped = groups.map((group) => {
      const existingGroup = initialState.groups.grouped.find(
        (g) => g.uid === group
      );
      return {
        ...existingGroup,
        types: Sortable.get(fieldListRefs.current[group]).toArray(),
      };
    });

    return {
      hidden,
      grouped,
    };
  }, [fieldListRefs, initialState]);

  return {
    addGroup,
    updateGroupInfo,
    syncFromRefs,
  };
};
