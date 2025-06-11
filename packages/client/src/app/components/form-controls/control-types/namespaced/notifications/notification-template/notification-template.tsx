import React from 'react';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import config from '@config/freeform/freeform.config';
import { NotificationTemplate } from '@ff-client/types/notifications';
import type { NotificationTemplateProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import { Category } from './category/category';
import { useNotificationEditModal } from './modal/template.modal.hooks';
import { useNotificationTemplates } from './notification-template.hooks';
import { NotificationTemplateSelector } from './notification-template.styles';

export type NotificationSelectHandler = (
  template: NotificationTemplate
) => void;

const NotificationTemplate: React.FC<
  ControlType<NotificationTemplateProperty>
> = ({ value, property, errors, updateValue }) => {
  const { templates, isFetching } = useNotificationTemplates(value);
  const openModal = useNotificationEditModal();

  const {
    templates: { canCreate },
  } = config;

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
      type: 'form',
      onSuccess: (id: number) => {
        updateValue(id);
      },
    });
  };

  return (
    <Control property={property} errors={errors}>
      <NotificationTemplateSelector>
        <Category
          value={value}
          title={translate('Form Templates')}
          templates={templates.form}
          onClick={handleSelect}
          canCreate={canCreate}
          onCreate={openModalFunction}
        />

        <Category
          value={value}
          title={translate('Global Templates')}
          templates={templates.global}
          onClick={handleSelect}
        />
      </NotificationTemplateSelector>
    </Control>
  );
};

export default NotificationTemplate;
