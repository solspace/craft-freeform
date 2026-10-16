import type { FormWithGroup } from "@ff-client/types/form-groups";

export type CardMove = {
  formId: number;
  groupUid: string | null;
  beforeId: number | null;
};

/** Apply one move without discarding group metadata or forms outside the current site. */
export const moveCard = (
  data: FormWithGroup,
  move: CardMove,
): FormWithGroup => {
  const groups = data.formGroups?.groups ?? [];
  const form = [
    ...(data.forms ?? []),
    ...groups.flatMap((group) => group.forms ?? []),
  ].find((form) => form.id === move.formId);
  if (
    !form ||
    (move.groupUid !== null &&
      !groups.some((group) => group.uid === move.groupUid))
  )
    return data;

  const insert = <T>(items: T[], item: T, getId: (item: T) => number): T[] => {
    const remaining = items.filter((item) => getId(item) !== move.formId);
    const index =
      move.beforeId === null
        ? -1
        : remaining.findIndex((item) => getId(item) === move.beforeId);
    remaining.splice(index < 0 ? remaining.length : index, 0, item);
    return remaining;
  };
  return {
    ...data,
    forms:
      move.groupUid === null
        ? insert(data.forms ?? [], form, (form) => form.id)
        : data.forms?.filter((form) => form.id !== move.formId),
    formGroups: data.formGroups && {
      ...data.formGroups,
      groups: groups.map((group) => ({
        ...group,
        formIds:
          group.uid === move.groupUid
            ? insert(group.formIds, move.formId, (id) => Number(id))
            : group.formIds.filter((id) => Number(id) !== move.formId),
        forms:
          group.uid === move.groupUid
            ? insert(group.forms ?? [], form, (form) => form.id)
            : group.forms?.filter((form) => form.id !== move.formId),
      })),
    },
  };
};

export const keyboardMove = (
  data: FormWithGroup,
  formId: number,
  key: string,
): CardMove | undefined => {
  const lists = [
    ...(data.formGroups?.groups ?? []).map((group) => ({
      uid: group.uid,
      forms: group.forms ?? [],
    })),
    { uid: null, forms: data.forms ?? [] },
  ];
  const groupIndex = lists.findIndex((list) =>
    list.forms.some((form) => form.id === formId),
  );
  if (groupIndex < 0) return;
  const list = lists[groupIndex];
  const index = list.forms.findIndex((form) => form.id === formId);
  if (key === "ArrowUp" && index > 0)
    return { formId, groupUid: list.uid, beforeId: list.forms[index - 1].id };
  if (key === "ArrowDown" && index < list.forms.length - 1)
    return {
      formId,
      groupUid: list.uid,
      beforeId: list.forms[index + 2]?.id ?? null,
    };
  const target =
    key === "ArrowLeft"
      ? lists[groupIndex - 1]
      : key === "ArrowRight"
        ? lists[groupIndex + 1]
        : undefined;
  if (target) return { formId, groupUid: target.uid, beforeId: null };
};
