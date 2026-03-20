import { contextActions } from "@editor/store/slices/context";
import { formActions } from "@editor/store/slices/form";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { layoutActions } from "@editor/store/slices/layout/layouts";
import {
  useQueryFormSettings,
  useQuerySingleForm,
} from "@ff-client/queries/forms";
import {
  useFormIntegrationsQueryReset,
  useQueryFormIntegrations,
} from "@ff-client/queries/integrations";
import {
  useNotificationQueryReset,
  useQueryFormNotifications,
} from "@ff-client/queries/notifications";
import {
  useQueryFormRules,
  useQueryNotificationRules,
  useRulesQueryReset,
} from "@ff-client/queries/rules";
import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Builder } from "./builder/builder";
import { LoaderBuilder } from "./builder/builder.loader";
import { useAppDispatch } from "./store";
import { pageActions } from "./store/slices/layout/pages";
import { rowActions } from "./store/slices/layout/rows";
import { translationActions } from "./store/slices/translations";
import { addNewPage } from "./store/thunks/pages";

type RouteParams = {
  formId: string;
};

export const Edit: React.FC = () => {
  const { formId } = useParams<RouteParams>();
  const numericFormId = formId ? Number(formId) : undefined;

  const dispatch = useAppDispatch();
  const resetNotifications = useNotificationQueryReset(numericFormId);
  const resetFormIntegrations = useFormIntegrationsQueryReset(numericFormId);
  const resetRules = useRulesQueryReset(numericFormId);

  useQueryFormSettings();
  useQueryFormRules(numericFormId);
  useQueryNotificationRules(numericFormId);
  useQueryFormNotifications(numericFormId);
  useQueryFormIntegrations(numericFormId);
  const { data, isFetching, isError, error } =
    useQuerySingleForm(numericFormId);

  useEffect(() => {
    if (formId === undefined || !data) return;

    const {
      translations,
      layout: { fields, pages, layouts, rows },
    } = data;

    dispatch(formActions.update(data));
    dispatch(fieldActions.set(fields));
    dispatch(pageActions.set(pages));
    dispatch(layoutActions.set(layouts));
    dispatch(rowActions.set(rows));
    dispatch(translationActions.init(translations));

    document.title = data.name;

    resetNotifications();
    resetFormIntegrations();
    resetRules();

    if (pages.length === 0) {
      dispatch(addNewPage());
    } else {
      dispatch(contextActions.setPage(pages.find(Boolean)?.uid));
    }
  }, [
    data,
    formId,
    dispatch,
    resetFormIntegrations,
    resetNotifications,
    resetRules,
  ]);

  if (isFetching) {
    return <LoaderBuilder />;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder />;
};
