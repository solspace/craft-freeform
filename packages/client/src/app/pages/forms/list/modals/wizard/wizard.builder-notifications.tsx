import { FormComponent } from "@components/form-controls";
import { Control } from "@components/form-controls/control";
import { Category } from "@components/form-controls/control-types/namespaced/notifications/notification-template/category/category";
import { NotificationTemplateSelector } from "@components/form-controls/control-types/namespaced/notifications/notification-template/notification-template.styles";
import { Sidebar } from "@components/layout/sidebar/sidebar";
import config from "@config/freeform/freeform.config";
import { EmptyEditor } from "@editor/builder/tabs/notifications/property-editor/property-editor.empty";
import {
  PropertyEditorWrapper,
  SettingsWrapper,
} from "@editor/builder/tabs/notifications/property-editor/property-editor.styles";
import IconManager from "@editor/builder/tabs/notifications/sidebar/icon.manager";
import {
  Icon,
  Link,
  Name,
  Status,
} from "@editor/builder/tabs/notifications/sidebar/items/item.styles";
import { NotificationTypeItem } from "@editor/builder/tabs/notifications/sidebar/items/type";
import { NotificationItemEmpty } from "@editor/builder/tabs/notifications/sidebar/items/type.styles";
import { ScrollableList } from "@editor/builder/tabs/notifications/sidebar/list.styles";
import type {
  Notification,
  NotificationTemplate,
  NotificationType,
} from "@ff-client/types/notifications";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type { WizardDraft, WizardOptions } from "./wizard.types";

export type WizardNotificationKind = "admin" | "confirmation";
export const notificationTitle = (kind: WizardNotificationKind) =>
  translate(kind === "admin" ? "Team notification" : "Visitor confirmation");
const kindOf = (type: NotificationType): WizardNotificationKind | undefined =>
  type.className.endsWith("\\Admin\\Admin")
    ? "admin"
    : type.className.endsWith("\\EmailField\\EmailField")
      ? "confirmation"
      : undefined;

export function wizardNotification(
  draft: WizardDraft,
  type: NotificationType,
  kind: WizardNotificationKind,
): Notification {
  const field = draft.fields.find(
    (field, index) =>
      (field.key.startsWith("extra") ? `customField${index}` : field.key) ===
      draft.confirmationField,
  );
  return {
    ...Object.fromEntries(
      type.properties.map((property) => [
        property.handle,
        structuredClone(property.value),
      ]),
    ),
    uid: `wizard-notification-${kind}`,
    className: type.className,
    name: notificationTitle(kind),
    enabled: kind === "admin" ? draft.adminEnabled : draft.confirmationEnabled,
    recipients: draft.adminEmail ? [{ email: draft.adminEmail, name: "" }] : [],
    field: field ? `wizard-field-${field.key}` : "",
    template:
      kind === "admin" ? draft.adminTemplate : draft.confirmationTemplate,
  };
}

export function WizardBuilderNotificationsSidebar({
  draft,
  options,
  types,
  selected,
}: {
  draft: WizardDraft;
  options: WizardOptions;
  types: NotificationType[];
  selected: WizardNotificationKind;
}) {
  return (
    <Sidebar $lean>
      <ScrollableList>
        {types
          .filter((type) =>
            config.limitations.can(`notifications.tab.${type.className}`),
          )
          .map((type) => {
            const kind = kindOf(type);
            const enabled =
              kind === "admin"
                ? draft.adminEnabled
                : kind === "confirmation"
                  ? draft.confirmationEnabled
                  : false;
            return (
              <div key={type.className} data-builder-notification-add={kind}>
                <NotificationTypeItem type={type}>
                  {kind && enabled ? (
                    <Link
                      to={`/wizard/notifications/${kind}`}
                      className={selected === kind ? "active" : undefined}
                      data-builder-notification={kind}
                    >
                      <Icon
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(type.icon || ""),
                        }}
                      />
                      <Name>{notificationTitle(kind)}</Name>
                      <Status $enabled className="status-dot" />
                    </Link>
                  ) : (
                    <NotificationItemEmpty>
                      {translate("None configured")}
                    </NotificationItemEmpty>
                  )}
                </NotificationTypeItem>
              </div>
            );
          })}
        {options.notificationTemplateMode !== "global" && (
          <Link to="/wizard/notifications/manager">
            <Icon>
              <IconManager />
            </Icon>
            <Name>{translate("Template Manager")}</Name>
          </Link>
        )}
      </ScrollableList>
    </Sidebar>
  );
}

export function WizardBuilderNotifications({
  draft,
  options,
  types,
  selected,
}: {
  draft: WizardDraft;
  options: WizardOptions;
  types: NotificationType[];
  selected: WizardNotificationKind;
}) {
  const type = types.find((type) => kindOf(type) === selected);
  const enabled =
    selected === "admin" ? draft.adminEnabled : draft.confirmationEnabled;
  if (!type || !enabled) return <EmptyEditor />;
  const notification = wizardNotification(draft, type, selected);
  const isNew =
    selected === "admin"
      ? draft.adminNewTemplate
      : draft.confirmationNewTemplate;
  const value = isNew
    ? `wizard-template-${selected}`
    : String(notification.template || "");
  const templates: NotificationTemplate[] = options.notificationTemplates.map(
    (template) => templateStub(template.value, template.label),
  );
  const newTemplate = templateStub(
    value,
    `${draft.name || translate("Your form")} - ${notificationTitle(selected)}`,
  );
  const formTemplate = isNew && options.notificationTemplateScope === "form";
  if (formTemplate) newTemplate.formId = -1;
  return (
    <PropertyEditorWrapper data-builder-target="notification-editor">
      <SettingsWrapper>
        {type.properties
          .filter(
            (property) =>
              property.handle !== "template" ||
              selected !== "confirmation" ||
              notification.field,
          )
          .map((property) => (
            <div
              key={property.handle}
              data-builder-notification-property={property.handle}
            >
              {property.handle === "template" ? (
                <Control property={property} context={notification}>
                  <NotificationTemplateSelector>
                    <Category
                      value={value}
                      title={translate("Form Templates")}
                      templates={formTemplate ? [newTemplate] : []}
                      onClick={() => {}}
                    />
                    <Category
                      value={value}
                      title={translate("Global Templates")}
                      templates={
                        isNew && !formTemplate
                          ? [...templates, newTemplate]
                          : templates
                      }
                      canEditGlobalTemplates={
                        config.permissions.notifications === "manage"
                      }
                      canEditGlobalFileTemplates={
                        config.permissions.notifications === "manage" &&
                        config.templates.allowFileTemplateEdit
                      }
                      onClick={() => {}}
                    />
                  </NotificationTemplateSelector>
                </Control>
              ) : (
                <FormComponent
                  property={property}
                  value={notification[property.handle]}
                  context={notification}
                  updateValue={() => {}}
                />
              )}
            </div>
          ))}
      </SettingsWrapper>
    </PropertyEditorWrapper>
  );
}

function templateStub(id: string, name: string): NotificationTemplate {
  return {
    id,
    name,
    handle: "",
    description: "",
    fromEmail: "",
    fromName: "",
    replyToName: "",
    replyToEmail: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    textBody: "",
    autoText: true,
    includeAttachments: false,
    presetAssets: [],
  };
}
