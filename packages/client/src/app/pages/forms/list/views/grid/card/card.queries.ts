import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type { FormCardDays } from "@ff-client/types/forms";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type CardStats = {
  period?: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  daily: { date: string; uv: number }[];
  total: number;
  previousTotal: number;
  changePercent: number | null;
  statuses: { id: number; name: string; count: number }[];
};
export type SummaryField = {
  id: number;
  label: string;
  kind: "number" | "options";
};
export type FieldSummary = SummaryField & {
  count: number;
  average: number | null;
  min: number | null;
  max: number | null;
  options: { label: string; count: number; percent: number }[];
};

export const useCardStats = (days: FormCardDays, enabled: boolean) => {
  const { current } = useSiteContext();
  return useQuery({
    queryKey: ["form-card-stats", current?.id, days],
    queryFn: ({ signal }) =>
      axios
        .get<{
          days: FormCardDays;
          from: string;
          to: string;
          forms: Record<number, CardStats>;
        }>("/api/forms/cards/stats", {
          params: { siteId: current?.id, days },
          signal,
        })
        .then((response) => response.data),
    enabled: enabled && !!current?.id,
    staleTime: 60_000,
    retry: false,
  });
};
export const useCardFields = (id: number, enabled: boolean) => {
  const { current } = useSiteContext();
  return useQuery({
    queryKey: ["form-card-fields", current?.id, id],
    queryFn: ({ signal }) =>
      axios
        .get<SummaryField[]>(`/api/forms/${id}/card-fields`, {
          params: { siteId: current?.id },
          signal,
        })
        .then((response) => response.data),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
};
export const useCardFieldSummary = (
  id: number,
  fieldId: number | null | undefined,
  days: FormCardDays,
) => {
  const { current } = useSiteContext();
  return useQuery({
    queryKey: ["form-card-field-summary", current?.id, id, fieldId, days],
    queryFn: ({ signal }) =>
      axios
        .get<FieldSummary>(`/api/forms/${id}/card-field-summary`, {
          params: { siteId: current?.id, fieldId, days },
          signal,
        })
        .then((response) => response.data),
    enabled: !!fieldId,
    staleTime: 60_000,
    retry: false,
  });
};
