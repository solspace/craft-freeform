import { useAppDispatch } from "@editor/store";
import { formActions } from "@editor/store/slices/form";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type {
  ExtendedFormType,
  FormSettingNamespace,
  FormWithStats,
} from "@ff-client/types/forms";
import type { Integration } from "@ff-client/types/integrations";
import type { Notification } from "@ff-client/types/notifications";
import type { Option } from "@ff-client/types/properties";
import type { NotificationRule } from "@ff-client/types/rules";
import type { UseQueryResult } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";
import { useParams } from "react-router-dom";
import type { FormRules } from "./rules";

export const QKForms = {
  base: ["forms"] as const,
  all: (site: string) => [...QKForms.base, site] as const,
  single: (id: number) => [...QKForms.base, id] as const,
  builder: (id: number) => [...QKForms.single(id), "builder"] as const,
  settings: () => [...QKForms.base, "settings"] as const,
  previewTemplates: (id: number, site?: string) =>
    [...QKForms.single(id), "preview-templates", site] as const,
  stats: (id: number, days: number = 90) =>
    [...QKForms.single(id), "stats", days] as const,
  usage: (id: number, siteId: number) =>
    [...QKForms.base, id, "usage", siteId] as const,
};

export const useQueryFormsWithStats = (): UseQueryResult<
  FormWithStats[],
  AxiosError
> => {
  const { current, getCurrentHandleWithFallback } = useSiteContext();

  return useQuery<FormWithStats[], AxiosError>({
    queryKey: QKForms.all(getCurrentHandleWithFallback()),
    queryFn: () =>
      axios
        .get<FormWithStats[]>("/api/forms", {
          params: { site: current?.handle },
        })
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQuerySingleForm = (
  id?: number,
): UseQueryResult<ExtendedFormType, AxiosError> => {
  return useQuery<ExtendedFormType, AxiosError>({
    queryKey: QKForms.single(id),
    queryFn: () =>
      axios.get<ExtendedFormType>(`/api/forms/${id}`).then((res) => res.data),
    staleTime: Infinity,
    enabled: !!id,
  });
};

export type FormBuilderData = {
  form: ExtendedFormType;
  rules: FormRules;
  notificationRules: NotificationRule[];
  notifications: Notification[];
  integrations: Integration[];
};

export const useQueryFormBuilder = (
  id?: number,
): UseQueryResult<FormBuilderData, AxiosError> =>
  useQuery<FormBuilderData, AxiosError>({
    queryKey: QKForms.builder(id),
    queryFn: () =>
      axios
        .get<FormBuilderData>(`/api/forms/${id}/builder`)
        .then((res) => res.data),
    staleTime: Infinity,
    enabled: !!id,
  });

export const useQueryFormSettings = (): UseQueryResult<
  FormSettingNamespace[],
  AxiosError
> => {
  const dispatch = useAppDispatch();

  return useQuery<FormSettingNamespace[], AxiosError>({
    queryKey: QKForms.settings(),
    queryFn: () =>
      axios
        .get<FormSettingNamespace[]>(`/api/forms/settings`)
        .then((res) => res.data)
        .then((res) => res.sort((a, b) => a.order - b.order))
        .then((res) => {
          dispatch(formActions.setInitialSettings(res));

          return res;
        }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQueryPreviewTemplates = (
  id?: number,
): UseQueryResult<Option[], AxiosError> => {
  const { current } = useSiteContext();
  return useQuery<Option[], AxiosError>({
    queryKey: QKForms.previewTemplates(id ?? 0, current?.handle),
    queryFn: () =>
      axios
        .get<Option[]>(`/api/forms/${id}/preview-templates`, {
          params: { site: current?.handle },
        })
        .then((res) => res.data),
    enabled: !!id,
  });
};

type FormUsageElement = {
  id: number;
  title: string;
  type: string;
  status: string;
  url: string;
};

type FormUsagePage = {
  items: FormUsageElement[];
  total: number;
  offset: number;
  limit: number;
};

export const useQueryFormUsage = (enabled = true) => {
  const { formId } = useParams();
  const { current } = useSiteContext();

  return useInfiniteQuery({
    queryKey: [...QKForms.usage(Number(formId), current?.id ?? 0), "pages"],
    enabled: enabled && !!Number(formId) && !!current?.id,
    initialPageParam: { offset: 0, limit: 5 },
    queryFn: ({ pageParam, signal }) =>
      axios
        .get<FormUsagePage>(`/api/forms/${formId}/elements`, {
          params: { site: current?.id, ...pageParam },
          signal,
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage) => {
      const offset = lastPage.offset + lastPage.limit;
      return offset < lastPage.total ? { offset, limit: 25 } : undefined;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};

type FormColors = Record<number, string | null>;
export const useQueryFormColors = (): FormColors => {
  const { data: forms } = useQueryFormsWithStats();

  const formColors =
    forms?.reduce<FormColors>((carry, form) => {
      carry[form.id] = form.settings?.general?.color || null;

      return carry;
    }, {}) || {};

  return formColors;
};

export type FormStatsDays = 7 | 30 | 90 | 365;

export type FormStats = {
  days: FormStatsDays;
  daily: Array<{ date: string; submissions: number; spam: number }>;
  totals: { submissions: number; spam: number };
  lastSubmissionAt: string | null;
  spamStored: boolean;
  generatedAt: string;
  phpVersion: string;
};

export const useQueryFormStats = (id?: number, days: FormStatsDays = 90) =>
  useQuery<FormStats, AxiosError>({
    queryKey: QKForms.stats(id ?? 0, days),
    queryFn: ({ signal }) =>
      axios
        .get<FormStats>(`/api/forms/${id}/stats`, { params: { days }, signal })
        .then((res) => res.data),
    placeholderData: (previous, query) =>
      query?.queryKey[1] === id ? previous : undefined,
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
