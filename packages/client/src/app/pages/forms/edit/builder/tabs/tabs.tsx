import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { useModal } from "@components/modals/modal.context";
import config, { Edition } from "@config/freeform/freeform.config";
import { useAppDispatch } from "@editor/store";
import { save } from "@editor/store/actions/form";
import { State } from "@editor/store/slices/context";
import { contextSelectors } from "@editor/store/slices/context/context.selectors";
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import { integrationSelectors } from "@editor/store/slices/integrations/integrations.selectors";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import { notificationSelectors } from "@editor/store/slices/notifications/notifications.selectors";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import { useSaveShortcut } from "@ff-client/hooks/use-save-shortcut";
import { useQueryFormSettings } from "@ff-client/queries/forms";
import classes from "@ff-client/utils/classes";
import { hasErrors } from "@ff-client/utils/errors";
import translate from "@ff-client/utils/translations";
import { generateUrl } from "@ff-client/utils/urls";
import type React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import { ConfirmSubmissionsModal } from "./modals/confirm-submissions.modal";
import {
  BetaLabel,
  FormName,
  Heading,
  SaveButton,
  SaveButtonWrapper,
  SubmissionsShortcut,
  TabsWrapper,
  TabWrapper,
} from "./tabs.styles";

export const Tabs: React.FC = () => {
  const limitations = config.limitations;
  const dispatch = useAppDispatch();
  const form = useSelector(formSelectors.current);
  const state = useSelector(contextSelectors.state);
  const { openModal } = useModal();

  const formErrors = useSelector(formSelectors.errors);
  const fieldsHaveErrors = useSelector(fieldSelectors.hasErrors);
  const notificationsHaveErrors = useSelector(notificationSelectors.errors.any);
  const hasIntegrationErrors = useSelector(integrationSelectors.errors.any);

  const { getTranslation } = useTranslations({
    ...form.settings.general,
    namespaceType: "settings",
    namespace: "general",
  });

  const formName = getTranslation("name", form.settings.general?.name);

  const { data: formSettingsData } = useQueryFormSettings();

  const triggerSave = (): void => void dispatch(save());
  useSaveShortcut(triggerSave);

  const storeDataEnabled = form.settings?.general?.storeData !== false;
  const canManageSubmissions = Boolean(form.canManageSubmissions);
  const showSubmissionsShortcut =
    Boolean(form.id) && storeDataEnabled && canManageSubmissions;
  const submissionCount = form.submissionCount ?? 0;
  const params = new URLSearchParams(window.location.search);
  const siteHandle = params.get("site");
  const submissionsUrl = `submissions?${siteHandle ? `site=${siteHandle}&` : ""}source=form:${form.id}`;

  const onSubmissionsClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ): void => {
    event.preventDefault();

    if (!form?.id) {
      return;
    }

    openModal(ConfirmSubmissionsModal, {
      url: generateUrl(submissionsUrl),
    });
  };

  return (
    <TabWrapper>
      <Breadcrumb
        id="form-name"
        label={form.name || "Create a new Form"}
        url={`/forms/${form.id}`}
      />

      <Heading>
        <FormName>{formName || translate("Create a new Form")}</FormName>
      </Heading>

      <TabsWrapper className="main-tabs">
        <NavLink
          to={`/forms/${form.id}`}
          end
          className={classes(fieldsHaveErrors && "errors")}
        >
          <span>{translate("Layout")}</span>
        </NavLink>
        {limitations.can("notifications.tab") && (
          <NavLink
            to={`/forms/${form.id}/notifications`}
            className={classes(notificationsHaveErrors && "errors")}
          >
            <span>{translate("Notifications")}</span>
          </NavLink>
        )}
        {limitations.can("rules.tab") && (
          <NavLink to={`/forms/${form.id}/rules`}>
            <span>{translate("Rules")}</span>
          </NavLink>
        )}
        {config.limitations.can("integrations.tab") && (
          <NavLink
            to={`/forms/${form.id}/integrations`}
            className={classes(hasIntegrationErrors && "errors")}
          >
            <span>{translate("Integrations")}</span>
          </NavLink>
        )}
        {config.editions.is(Edition.Pro) && form.formMonitor.enabled && (
          <NavLink to={`/forms/${form.id}/form-monitor`}>
            <span>
              {translate("Monitoring")}
              <BetaLabel>BETA</BetaLabel>
            </span>
          </NavLink>
        )}
        {formSettingsData && config.limitations.can("settings.tab") && (
          <NavLink
            to={`/forms/${form.id}/settings`}
            className={classes(
              (hasErrors(formErrors?.general) ||
                hasErrors(formErrors?.behavior)) &&
                "errors",
            )}
          >
            <span>{translate("Settings")}</span>
          </NavLink>
        )}
      </TabsWrapper>

      {showSubmissionsShortcut && (
        <SubmissionsShortcut
          href={generateUrl(submissionsUrl)}
          onClick={onSubmissionsClick}
          title={translate("View submissions")}
          className="go"
        >
          {submissionCount} {translate("submissions")}
        </SubmissionsShortcut>
      )}

      <SaveButtonWrapper>
        <SaveButton
          onClick={triggerSave}
          disabled={state === State.Processing}
          className={classes("btn", "submit", "save-button")}
        >
          <LoadingText
            loadingText={translate("Saving...")}
            loading={state === State.Processing}
            spinner
          >
            {translate("Save")}
          </LoadingText>
        </SaveButton>
      </SaveButtonWrapper>
    </TabWrapper>
  );
};
