import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { useRenderContext } from "@components/form-controls/context/render.context";
import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import config, { TemplateMethod } from "@config/freeform/freeform.config";
import type { NotificationTemplate as NotificationTemplateType } from "@ff-client/types/notifications";
import type { NotificationTemplateProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { Category } from "./category/category";
import { useNotificationEditModal } from "./modal/template.modal.hooks";
import { useNotificationTemplates } from "./notification-template.hooks";
import { NotificationTemplateSelector } from "./notification-template.styles";

export type NotificationSelectHandler = (
  template: NotificationTemplateType,
) => void;

const NotificationTemplate: React.FC<
  ControlType<NotificationTemplateProperty>
> = ({ value, property, errors, updateValue, context }) => {
  const { size } = useRenderContext();
  const { templates, options, isFetching } = useNotificationTemplates(value);
  const openModal = useNotificationEditModal();

  const {
    templates: { canCreate, method },
  } = config;
  const canManageGlobalTemplates =
    config.permissions.notifications === "manage";
  const canEditGlobalFileTemplates =
    canManageGlobalTemplates && config.templates.allowFileTemplateEdit;

  if (isFetching && !templates) {
    return (
      <Control property={property} errors={errors}>
        loading
      </Control>
    );
  }

  const handleSelect: NotificationSelectHandler = (template) => {
    updateValue(template.id);
  };

  const openModalFunction = (): void => {
    openModal({
      type: "form",
      onSuccess: (id: number) => {
        updateValue(id);
      },
    });
  };

  return (
    <Control property={property} errors={errors} context={context}>
      {size === "small" && (
        <Dropdown
          emptyOption="Select a template"
          loading={isFetching}
          options={options}
          onChange={(value) => updateValue(value)}
          value={String(value || "")}
        />
      )}
      {size === "normal" && (
        <NotificationTemplateSelector>
          <Category
            value={value}
            title={translate("Form Templates")}
            templates={templates.form}
            onClick={handleSelect}
            canCreate={canCreate && method !== TemplateMethod.Global}
            onCreate={openModalFunction}
          />

          <Category
            value={value}
            title={translate("Global Templates")}
            templates={templates.global}
            canEditGlobalTemplates={canManageGlobalTemplates}
            canEditGlobalFileTemplates={canEditGlobalFileTemplates}
            onClick={handleSelect}
          />
        </NotificationTemplateSelector>
      )}
    </Control>
  );
};

export default NotificationTemplate;
