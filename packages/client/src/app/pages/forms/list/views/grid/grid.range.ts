import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import type { FormWithGroup } from "@ff-client/types/form-groups";
import type { FormCardDays } from "@ff-client/types/forms";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useState } from "react";

export const useCardRange = (saved: FormCardDays = 30) => {
  const { current, getCurrentHandleWithFallback } = useSiteContext();
  const site = getCurrentHandleWithFallback();
  const client = useQueryClient();
  const busy = useRef(false);
  const [pending, setPending] = useState<{
    days: FormCardDays;
    site: string;
  }>();
  const days = pending?.site === site ? pending.days : saved;
  const change = async (next: FormCardDays) => {
    if (busy.current || next === days || !current?.id) return;
    busy.current = true;
    const key = QKGroups.all(site);
    const patch = (value: FormCardDays) =>
      client.setQueryData<FormWithGroup>(
        key,
        (data) => data && { ...data, cardRange: value },
      );
    setPending({ days: next, site });
    try {
      await client.cancelQueries({ queryKey: key, exact: true });
      patch(next);
      await axios.post(
        "/api/forms/cards/range",
        { siteId: current.id, days: next },
        { timeout: 15_000 },
      );
      await client.cancelQueries({ queryKey: key, exact: true });
      patch(next);
      void client.invalidateQueries({
        queryKey: key,
        exact: true,
        refetchType: "none",
      });
    } catch {
      await client.cancelQueries({ queryKey: key, exact: true });
      patch(saved);
      notifications.error(
        translate("Could not save the chart range. Please try again."),
      );
    } finally {
      busy.current = false;
      setPending(undefined);
    }
  };
  return { days, change, isSaving: !!pending };
};
