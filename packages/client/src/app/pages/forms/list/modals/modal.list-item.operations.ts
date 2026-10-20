import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type {
  FormWithGroup,
  GroupItem,
  UpdateFormGroup,
} from "@ff-client/types/form-groups";
import type { FormWithStats } from "@ff-client/types/forms";
import translate from "@ff-client/utils/translations";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import { v4 } from "uuid";

// Retain memberships for forms outside the current site's visible form list.
const withForms = (group: GroupItem, forms: FormWithStats[]): GroupItem => ({
  ...group,
  forms,
  formIds: [
    ...forms.map(({ id }) => id),
    ...group.formIds.filter(
      (id) => !group.forms?.some((form) => form.id === id),
    ),
  ],
});

export const useFormGroupsOperations = (
  state: FormWithGroup,
  setState: Dispatch<SetStateAction<FormWithGroup>>,
) => {
  const { getCurrentHandleWithFallback, current } = useSiteContext();

  const addGroup = useCallback(() => {
    const uid = v4();
    setState((previous) => ({
      ...previous,
      formGroups: {
        ...previous.formGroups,
        groups: [
          ...(previous.formGroups?.groups || []),
          {
            uid,
            label: translate("New group"),
            formIds: [],
            forms: [],
          },
        ],
      },
    }));
    return uid;
  }, [setState]);

  const renameGroup = useCallback(
    (uid: string, label: string) => {
      setState((previous) => ({
        ...previous,
        formGroups: {
          ...previous.formGroups,
          groups: previous.formGroups.groups.map((group) =>
            group.uid === uid ? { ...group, label } : group,
          ),
        },
      }));
    },
    [setState],
  );

  const removeGroup = useCallback(
    (uid: string) => {
      setState((previous) => {
        const removed = previous.formGroups.groups.find(
          (group) => group.uid === uid,
        );
        if (!removed) return previous;
        return {
          ...previous,
          forms: [...(previous.forms || []), ...(removed.forms || [])],
          formGroups: {
            ...previous.formGroups,
            groups: previous.formGroups.groups.filter(
              (group) => group.uid !== uid,
            ),
          },
        };
      });
    },
    [setState],
  );

  const moveForm = useCallback(
    (id: number, targetUid: string | null, index?: number) => {
      setState((previous) => {
        const groups = previous.formGroups?.groups || [];
        const source = groups.find((group) =>
          group.forms?.some((form) => form.id === id),
        );
        const form = (source?.forms || previous.forms)?.find(
          (form) => form.id === id,
        );
        if (
          !form ||
          (targetUid !== null &&
            !groups.some((group) => group.uid === targetUid))
        )
          return previous;
        const insert = (forms: FormWithStats[] = []) => {
          const next = forms.filter((form) => form.id !== id);
          next.splice(index ?? next.length, 0, form);
          return next;
        };
        return {
          ...previous,
          forms:
            targetUid === null
              ? insert(previous.forms)
              : previous.forms?.filter((form) => form.id !== id),
          formGroups: {
            ...previous.formGroups,
            groups: groups.map((group) => {
              if (group.uid === targetUid)
                return withForms(group, insert(group.forms));
              if (group.uid === source?.uid)
                return withForms(
                  group,
                  group.forms.filter((form) => form.id !== id),
                );
              return group;
            }),
          },
        };
      });
    },
    [setState],
  );

  const moveGroup = useCallback(
    (uid: string, index: number) => {
      setState((previous) => {
        const groups = [...previous.formGroups.groups];
        const from = groups.findIndex((group) => group.uid === uid);
        if (from < 0 || from === index || index < 0 || index >= groups.length)
          return previous;
        const [group] = groups.splice(from, 1);
        groups.splice(index, 0, group);
        return { ...previous, formGroups: { ...previous.formGroups, groups } };
      });
    },
    [setState],
  );

  const payload: UpdateFormGroup = {
    siteId: state.formGroups?.siteId || current?.id,
    site: state.formGroups?.site || getCurrentHandleWithFallback(),
    groups: (state.formGroups?.groups || []).map(({ uid, label, formIds }) => ({
      uid,
      label: label || "",
      formIds,
    })),
    orderedFormIds: [
      ...(state.formGroups?.groups || []).flatMap(
        (group) => group.forms?.map(({ id }) => id) || [],
      ),
      ...(state.forms || []).map(({ id }) => id),
    ],
  };

  return { addGroup, renameGroup, removeGroup, moveForm, moveGroup, payload };
};
