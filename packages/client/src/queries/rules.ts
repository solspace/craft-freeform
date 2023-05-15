import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { fieldRuleActions } from '@editor/store/slices/rules/fields';
import { notificationRuleActions } from '@editor/store/slices/rules/notifications';
import { pageRuleActions } from '@editor/store/slices/rules/pages';
import type {
  FieldRule,
  NotificationRule,
  PageRule,
} from '@ff-client/types/rules';
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
};

export const useQueryFormRules = (
  formId: number
): UseQueryResult<FormRules, AxiosError> => {
  const dispatch = useDispatch();

  return useQuery<FormRules, AxiosError>(
    QKRules.form(formId),
    () =>
      axios
        .get<FormRules>(`/client/api/forms/${formId}/rules`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (rules) => {
        dispatch(fieldRuleActions.set(rules.fields));
        dispatch(pageRuleActions.set(rules.pages));
      },
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
          `/client/api/forms/${formId}/rules/notifications`
        )
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (rules) => {
        dispatch(notificationRuleActions.set(rules));
      },
    }
  );
};
