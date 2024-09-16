import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import type {
  FormGroupsListRefs,
  FormWithGroup,
  UpdateFormGroup,
} from '@ff-client/types/form-groups';
import Sortable from 'sortablejs';
import { v4 } from 'uuid';

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type GroupOperations = {
  addGroup: () => void;
  updateGroupInfo: (property: 'label', value: string, groupUid: string) => void;
  syncFormGroupsRefs: () => UpdateFormGroup;
};

export const useFormGroupsOperations = (
  initialState: FormWithGroup,
  setState: StateSetter<FormWithGroup>,
  formGroupsListRefs: React.MutableRefObject<FormGroupsListRefs>
): GroupOperations => {
  const { getCurrentHandleWithFallback, current } = useSiteContext();

  const addGroup = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      formGroups: {
        ...prevState.formGroups,
        site: prevState.formGroups?.site
          ? prevState.formGroups.site
          : getCurrentHandleWithFallback(),
        groups: [
          ...(prevState.formGroups?.groups || []),
          {
            uid: v4(),
            label: '',
            formIds: [],
          },
        ],
      },
    }));
  }, [setState, getCurrentHandleWithFallback]);

  const updateGroupInfo = useCallback(
    (property: 'label', value: string, groupUid: string) => {
      setState((prevState) => ({
        ...prevState,
        formGroups: {
          ...prevState.formGroups,
          groups: prevState.formGroups.groups.map((group) =>
            group.uid === groupUid ? { ...group, [property]: value } : group
          ),
        },
      }));
    },
    [setState]
  );

  const syncFormGroupsRefs = useCallback((): UpdateFormGroup => {
    const groupUIDs = Sortable.get(
      formGroupsListRefs.current.groupWrapper
    ).toArray();

    const sortedGroups = groupUIDs
      .map((groupUid) => {
        const existingGroup = initialState.formGroups?.groups.find(
          (group) => group.uid === groupUid
        );

        if (existingGroup) {
          const groupWithoutForms = { ...existingGroup };
          delete groupWithoutForms.forms;

          return {
            ...groupWithoutForms,
            formIds: Sortable.get(formGroupsListRefs.current[groupUid])
              .toArray()
              .map(Number),
          };
        }

        return null;
      })
      .filter(Boolean) as { uid: string; label: string; formIds: number[] }[];

    const unassignedElement = formGroupsListRefs.current?.unassigned;
    const unassignedSortableInstance = unassignedElement
      ? Sortable.get(unassignedElement)
      : null;
    const unassignedFormIds = unassignedSortableInstance
      ? unassignedSortableInstance.toArray().map(Number)
      : [];

    const orderedFormIds = [
      ...sortedGroups.flatMap((group) => group.formIds),
      ...unassignedFormIds,
    ];

    return {
      siteId: initialState.formGroups?.siteId || current?.id,
      site: initialState.formGroups?.site || getCurrentHandleWithFallback(),
      groups: sortedGroups,
      orderedFormIds,
    };
  }, [formGroupsListRefs, initialState, getCurrentHandleWithFallback]);

  return {
    addGroup,
    updateGroupInfo,
    syncFormGroupsRefs,
  };
};
