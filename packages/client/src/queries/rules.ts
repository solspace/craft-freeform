import { buttonRuleActions } from "@editor/store/slices/rules/buttons";
import { fieldRuleActions } from "@editor/store/slices/rules/fields";
import { integrationRuleActions } from "@editor/store/slices/rules/integrations";
import { notificationRuleActions } from "@editor/store/slices/rules/notifications";
import { pageRuleActions } from "@editor/store/slices/rules/pages";
import { submitFormRuleActions } from "@editor/store/slices/rules/submit-form";
import type {
  ButtonRule,
  FieldRule,
  IntegrationRule,
  NotificationRule,
  PageRule,
  SubmitFormRule,
} from "@ff-client/types/rules";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

export const QKRules = {
  all: ["rules"] as const,
  form: (formId: number) => [...QKRules.all, "forms", formId] as const,
  notifications: (formId: number) =>
    [...QKRules.form(formId), "notifications"] as const,
  integrations: (formId: number) =>
    [...QKRules.form(formId), "integrations"] as const,
};

type FormRules = {
  fields: FieldRule[];
  pages: PageRule[];
  submitForm?: SubmitFormRule;
  buttons: ButtonRule[];
};

export const useRulesQueryReset = (formId?: number): (() => void) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!formId) {
      return;
    }

    queryClient.removeQueries({ queryKey: QKRules.form(formId) });
  }, [formId, queryClient]);
};

export const useQueryFormRules = (
  formId: number,
): UseQueryResult<FormRules, AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<FormRules, AxiosError>({
    queryKey: QKRules.form(formId),
    queryFn: () =>
      axios
        .get<FormRules>(`/api/forms/${formId}/rules`)
        .then((res) => res.data)
        .then((res) => {
          dispatch(fieldRuleActions.set(res.fields));
          dispatch(pageRuleActions.set(res.pages));
          dispatch(submitFormRuleActions.set(res.submitForm));
          dispatch(buttonRuleActions.set(res.buttons));

          return res;
        }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQueryNotificationRules = (
  formId: number,
): UseQueryResult<NotificationRule[]> => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: QKRules.notifications(formId),
    queryFn: () =>
      axios
        .get<NotificationRule[]>(
          `/api/forms/${formId || 0}/rules/notifications`,
        )
        .then((res) => res.data)
        .then((res) => {
          dispatch(notificationRuleActions.set(res));

          return res;
        }),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useQueryIntegrationRules = (
  formId: number,
): UseQueryResult<IntegrationRule[]> => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: QKRules.integrations(formId),
    queryFn: () =>
      axios
        .get<IntegrationRule[]>(`/api/forms/${formId || 0}/rules/integrations`)
        .then((res) => res.data)
        .then((res) => {
          dispatch(integrationRuleActions.set(res));

          return res;
        }),

    staleTime: Infinity,
    gcTime: Infinity,
  });
};
