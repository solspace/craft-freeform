import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import type { FormWithGroup } from "@ff-client/types/form-groups";
import type {
  FormCardContent,
  FormCardSize,
  FormWithStats,
} from "@ff-client/types/forms";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useState } from "react";

type CardPreference = Partial<
  Pick<FormWithStats, "cardSize" | "cardContent" | "cardFieldId">
>;
const withPreference = (
  data: FormWithGroup | undefined,
  id: number,
  patch: CardPreference,
) => {
  if (!data) return data;
  const update = (form: FormWithStats) =>
    form.id === id ? { ...form, ...patch } : form;
  return {
    ...data,
    forms: data.forms?.map(update),
    formGroups: data.formGroups && {
      ...data.formGroups,
      groups: data.formGroups.groups.map((group) => ({
        ...group,
        forms: group.forms?.map(update),
      })),
    },
  };
};

export const useCardSizing = () => {
  const { current, getCurrentHandleWithFallback } = useSiteContext();
  const client = useQueryClient();
  const busy = useRef(false);
  const [pending, setPending] = useState<{
    id: number;
    patch: CardPreference;
    site: string;
  }>();
  const site = getCurrentHandleWithFallback();

  const save = async (
    form: FormWithStats,
    patch: CardPreference,
    endpoint: string,
    body: object,
    success: string,
    failure: string,
  ) => {
    if (busy.current || !current?.id) return;
    busy.current = true;
    const key = QKGroups.all(site);
    const previous: CardPreference = patch.cardSize
      ? { cardSize: form.cardSize ?? "1x1" }
      : {
          cardContent: form.cardContent ?? "overview",
          cardFieldId: form.cardFieldId ?? null,
        };
    setPending({ id: form.id, patch, site });
    try {
      await client.cancelQueries({ queryKey: key, exact: true });
      client.setQueryData<FormWithGroup>(key, (data) =>
        withPreference(data, form.id, patch),
      );
      await axios.post(
        endpoint,
        { formId: form.id, siteId: current.id, ...body },
        { timeout: 15_000 },
      );
      // A focus/reconnect reload may have started during the save. Discard it
      // before installing the confirmed value in this site's cache.
      await client.cancelQueries({ queryKey: key, exact: true });
      client.setQueryData<FormWithGroup>(key, (data) =>
        withPreference(data, form.id, patch),
      );
      void client.invalidateQueries({
        queryKey: key,
        exact: true,
        refetchType: "none",
      });
      notifications.success(translate(success));
    } catch {
      await client.cancelQueries({ queryKey: key, exact: true });
      client.setQueryData<FormWithGroup>(key, (data) =>
        withPreference(data, form.id, previous),
      );
      notifications.error(translate(failure));
    } finally {
      busy.current = false;
      setPending(undefined);
    }
  };

  return {
    resize: (form: FormWithStats, size: FormCardSize) =>
      size !== (form.cardSize ?? "1x1") &&
      save(
        form,
        { cardSize: size },
        "/api/forms/cards/size",
        { size },
        "Card size saved.",
        "Could not save the card size. Please try again.",
      ),
    setContent: (
      form: FormWithStats,
      content: FormCardContent,
      fieldId: number | null = null,
    ) =>
      save(
        form,
        { cardContent: content, cardFieldId: fieldId },
        "/api/forms/cards/preferences",
        { content, fieldId },
        "Card content saved.",
        "Could not save the card content. Please try again.",
      ),
    isSaving: !!pending,
    getSize: (form: FormWithStats): FormCardSize =>
      pending?.site === site && pending.id === form.id
        ? (pending.patch.cardSize ?? form.cardSize ?? "1x1")
        : (form.cardSize ?? "1x1"),
    getContent: (form: FormWithStats): FormCardContent =>
      pending?.site === site && pending.id === form.id
        ? (pending.patch.cardContent ?? form.cardContent ?? "overview")
        : (form.cardContent ?? "overview"),
    getFieldId: (form: FormWithStats): number | null =>
      pending?.site === site &&
      pending.id === form.id &&
      "cardFieldId" in pending.patch
        ? (pending.patch.cardFieldId ?? null)
        : (form.cardFieldId ?? null),
  };
};
