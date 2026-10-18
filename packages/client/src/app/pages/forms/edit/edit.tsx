import { contextActions } from "@editor/store/slices/context";
import { formActions } from "@editor/store/slices/form";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { layoutActions } from "@editor/store/slices/layout/layouts";
import {
  type FormBuilderData,
  useQueryFormBuilder,
  useQueryFormSettings,
} from "@ff-client/queries/forms";
import {
  QKIntegrations,
  useFormIntegrationsQueryReset,
} from "@ff-client/queries/integrations";
import {
  QKNotifications,
  useNotificationQueryReset,
} from "@ff-client/queries/notifications";
import { QKRules, useRulesQueryReset } from "@ff-client/queries/rules";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Builder } from "./builder/builder";
import { LoaderBuilder } from "./builder/builder.loader";
import { useAppDispatch } from "./store";
import { integrationActions } from "./store/slices/integrations";
import { pageActions } from "./store/slices/layout/pages";
import { rowActions } from "./store/slices/layout/rows";
import { notificationActions } from "./store/slices/notifications";
import { buttonRuleActions } from "./store/slices/rules/buttons";
import { fieldRuleActions } from "./store/slices/rules/fields";
import { notificationRuleActions } from "./store/slices/rules/notifications";
import { pageRuleActions } from "./store/slices/rules/pages";
import { submitFormRuleActions } from "./store/slices/rules/submit-form";
import { translationActions } from "./store/slices/translations";
import { addNewPage } from "./store/thunks/pages";

type RouteParams = {
  formId: string;
};

export const Edit: React.FC = () => {
  const { formId } = useParams<RouteParams>();
  const numericFormId = formId ? Number(formId) : undefined;

  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState<FormBuilderData>();
  const resetNotifications = useNotificationQueryReset(numericFormId);
  const resetFormIntegrations = useFormIntegrationsQueryReset(numericFormId);
  const resetRules = useRulesQueryReset(numericFormId);

  useQueryFormSettings();
  const { data, isFetching, isError, error } =
    useQueryFormBuilder(numericFormId);

  useEffect(() => {
    if (formId === undefined || !data) return;

    const { form, rules, notificationRules, notifications, integrations } =
      data;
    const {
      translations,
      layout: { fields, pages, layouts, rows },
    } = form;

    resetNotifications();
    resetFormIntegrations();
    resetRules();

    queryClient.setQueryData(QKRules.form(numericFormId), rules);
    queryClient.setQueryData(
      QKRules.notifications(numericFormId),
      notificationRules,
    );
    queryClient.setQueryData(
      QKNotifications.single(numericFormId),
      notifications,
    );
    queryClient.setQueryData(QKIntegrations.form(numericFormId), integrations);

    dispatch(formActions.update(form));
    dispatch(fieldRuleActions.set(rules.fields));
    dispatch(pageRuleActions.set(rules.pages));
    dispatch(submitFormRuleActions.set(rules.submitForm));
    dispatch(buttonRuleActions.set(rules.buttons));
    dispatch(notificationRuleActions.set(notificationRules));
    dispatch(notificationActions.set(notifications));
    dispatch(integrationActions.set(integrations));
    dispatch(fieldActions.set(fields));
    dispatch(pageActions.set(pages));
    dispatch(layoutActions.set(layouts));
    dispatch(rowActions.set(rows));
    dispatch(translationActions.init(translations));

    document.title = form.name;

    if (pages.length === 0) {
      dispatch(addNewPage());
    } else {
      dispatch(contextActions.setPage(pages.find(Boolean)?.uid));
    }
    setHydrated(data);
  }, [
    data,
    formId,
    numericFormId,
    queryClient,
    dispatch,
    resetFormIntegrations,
    resetNotifications,
    resetRules,
  ]);

  if (isFetching || (!isError && (!data || hydrated !== data))) {
    return <LoaderBuilder />;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder formId={numericFormId} />;
};
