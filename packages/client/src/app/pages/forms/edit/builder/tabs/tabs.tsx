import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { useModal } from "@components/modals/modal.context";
import config, { Edition } from "@config/freeform/freeform.config";
import { useAppDispatch, useAppSelector } from "@editor/store";
import { save } from "@editor/store/actions/form";
import { historyActions } from "@editor/store/history";
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
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { HistoryArrow } from "./history-arrow";
import { ConfirmSubmissionsModal } from "./modals/confirm-submissions.modal";
import {
  FormName,
  Heading,
  HistoryButton,
  HistoryControls,
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
  const { openModal, hasOpenModals } = useModal();
  const { undoCount, redoCount } = useAppSelector((state) => state.history);

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        hasOpenModals ||
        state === State.Processing ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey
      )
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable], [role='textbox']",
        )
      )
        return;

      const key = event.key.toLowerCase();
      const redo =
        (key === "z" && event.shiftKey) || (key === "y" && !event.shiftKey);
      const undo = key === "z" && !event.shiftKey;
      if (!(redo || undo)) return;
      if (redo ? !redoCount : !undoCount) return;

      event.preventDefault();
      dispatch(redo ? historyActions.redo() : historyActions.undo());
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dispatch, hasOpenModals, state, undoCount, redoCount]);

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
            <span>{translate("Monitoring")}</span>
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
        <HistoryControls>
          <HistoryButton
            type="button"
            onClick={() => dispatch(historyActions.undo())}
            disabled={!undoCount || state === State.Processing || hasOpenModals}
            title={translate("Undo")}
            aria-label={translate("Undo")}
          >
            <HistoryArrow direction="undo" />
          </HistoryButton>
          <HistoryButton
            type="button"
            onClick={() => dispatch(historyActions.redo())}
            disabled={!redoCount || state === State.Processing || hasOpenModals}
            title={translate("Redo")}
            aria-label={translate("Redo")}
          >
            <HistoryArrow direction="redo" />
          </HistoryButton>
        </HistoryControls>
        <SaveButton
          type="button"
          onClick={triggerSave}
          disabled={state === State.Processing}
          className={classes("btn", "submit", "save-button")}
        >
          <LoadingText
            loadingText={translate("Saving")}
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
