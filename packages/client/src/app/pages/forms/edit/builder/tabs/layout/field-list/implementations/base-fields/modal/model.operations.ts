import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import type {
  FieldListRefs,
  Group,
  GroupData,
  GroupItem,
} from '@ff-client/types/groups';
import { v4 } from 'uuid';

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type GroupOperations = {
  addGroup: () => void;
  removeGroup: (groupUid: string) => void;
  updateGroupInfo: (
    property: 'label' | 'color',
    value: string,
    groupUid: string
  ) => void;
  addItemToUnassigned: (typeIndex: number) => void;
  syncFormRefs: () => GroupItem;
};

const getAttributes = (
  element: HTMLElement,
  attribute: string
): number | null => {
  const attributeValue = element.getAttribute(attribute);
  return attributeValue !== null ? Number(attributeValue) : null;
};

const mapGroupIdsToGrouped = (
  groupIds: string[],
  initialState: Group,
  fieldListRefs: React.MutableRefObject<FieldListRefs>
): GroupData[] => {
  return groupIds.map((id) => {
    const group = initialState.groups?.grouped.find((item) => item.uid === id);
    const foundGroupEl = fieldListRefs.current[id];
    const types = Array.from(foundGroupEl?.children || []).map((itemEl) =>
      getAttributes(itemEl as HTMLElement, 'data-types-index')
    );
    return {
      ...group,
      types: types.filter((index) => index !== null) as number[],
    };
  });
};

export const useGroupOperations = (
  initialState: Group,
  setState: StateSetter<Group>,
  fieldListRefs: React.MutableRefObject<FieldListRefs>
): GroupOperations => {
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
            color: '#000',
            types: [],
          },
        ],
      },
    }));
  }, [setState]);

  const removeGroup = useCallback(
    (groupUid: string) => {
      setState((prevState) => {
        const removedGroupDiv = fieldListRefs.current[groupUid];
        if (!removedGroupDiv) {
          return prevState;
        }

        const typeIndexes = Array.from(removedGroupDiv.children)
          .map((node: HTMLElement) => node.getAttribute('data-types-index'))
          .filter((index: string | null) => index !== null)
          .map((index: string | null) => Number(index || '0'));

        const updatedUnassigned = [
          ...prevState.groups.unassigned,
          ...typeIndexes,
        ];

        const updatedGrouped = prevState.groups.grouped.filter(
          (group) => group.uid !== groupUid
        );

        return {
          ...prevState,
          groups: {
            ...prevState.groups,
            grouped: updatedGrouped,
            unassigned: updatedUnassigned,
          },
        };
      });
    },
    [setState]
  );

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

  const addItemToUnassigned = useCallback(
    (typeIndex: number) => {
      setState((prevState) => ({
        ...prevState,
        groups: {
          ...prevState.groups,
          unassigned: [...prevState.groups.unassigned, typeIndex],
        },
      }));
    },
    [setState]
  );

  const syncFormRefs = useCallback(() => {
    const groupWrapper = fieldListRefs.current.groupWrapper;
    const hiddenWrapper = fieldListRefs.current.hidden;

    if (!groupWrapper || !hiddenWrapper) {
      return { hidden: [], grouped: [] };
    }

    const groupIds = Array.from(groupWrapper.children || [])
      .map((groupEl) => groupEl.getAttribute('data-id'))
      .filter((id) => id !== null);

    const grouped = mapGroupIdsToGrouped(groupIds, initialState, fieldListRefs);

    const hidden = Array.from(hiddenWrapper.children)
      .map((hiddenEl) =>
        getAttributes(hiddenEl as HTMLElement, 'data-types-index')
      )
      .filter((index) => index !== null) as number[];

    return {
      hidden,
      grouped,
    };
  }, [fieldListRefs, initialState]);

  return {
    addGroup,
    removeGroup,
    updateGroupInfo,
    addItemToUnassigned,
    syncFormRefs,
  };
};
