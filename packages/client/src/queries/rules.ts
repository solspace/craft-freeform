import { useDispatch } from 'react-redux';
import { fieldRuleActions } from '@editor/store/slices/rules/fields';
import { notificationRuleActions } from '@editor/store/slices/rules/notifications';
import { pageRuleActions } from '@editor/store/slices/rules/pages';
import { submitFormRuleActions } from '@editor/store/slices/rules/submit-form';
import type {
  FieldRule,
  NotificationRule,
  PageRule,
  SubmitFormRule,
} from '@ff-client/types/rules';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKRules = {
  all: ['rules'] as const,
  form: (formId: number) => [...QKRules.all, 'forms', formId] as const,
  notifications: (formId: number) =>
    [...QKRules.form(formId), 'notifications'] as const,
};

type FormRules = {
  fields: FieldRule[];
  pages: PageRule[];
  submitForm?: SubmitFormRule;
};

export const useRulesQueryReset = (): (() => void) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries(QKRules.all);
  };
};

export const useQueryFormRules = (
  formId: number
): UseQueryResult<FormRules, AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<FormRules, AxiosError>(
    QKRules.form(formId),
    () =>
      axios
        .get<FormRules>(`/api/forms/${formId}/rules`)
        .then((res) => res.data)
        .then((res) => {
          dispatch(fieldRuleActions.set(res.fields));
          dispatch(pageRuleActions.set(res.pages));
          dispatch(submitFormRuleActions.set(res.submitForm));

          return res;
        }),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const useQueryNotificationRules = (
  formId: number
): UseQueryResult<NotificationRule[]> => {
  const dispatch = useDispatch();

  return useQuery(
    QKRules.notifications(formId),
    () =>
      axios
        .get<NotificationRule[]>(
          `/api/forms/${formId || 0}/rules/notifications`
        )
        .then((res) => res.data)
        .then((res) => {
          dispatch(notificationRuleActions.set(res));

          return res;
        }),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};
