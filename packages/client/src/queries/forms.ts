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
import { useQuery } from "@tanstack/react-query";
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

type FormUsage = Array<{
  id: number;
  title: string;
  type: string;
  status: string;
  url: string;
}>;

export const useQueryFormUsage = (): UseQueryResult<FormUsage, AxiosError> => {
  const { formId } = useParams();
  const { current } = useSiteContext();

  return useQuery({
    queryKey: QKForms.usage(Number(formId), current.id),
    queryFn: () =>
      axios
        .get(`/api/forms/${formId}/elements?site=${current.id}`)
        .then((res) => res.data),
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
