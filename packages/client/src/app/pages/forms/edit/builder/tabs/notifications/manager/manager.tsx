import type { FC } from 'react';
import React from 'react';
import { useResolvedPath } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { Category } from '@components/form-controls/control-types/namespaced/notifications/notification-template/category/category';
import { useNotificationEditModal } from '@components/form-controls/control-types/namespaced/notifications/notification-template/modal/template.modal.hooks';
import { useNotificationTemplates } from '@components/form-controls/control-types/namespaced/notifications/notification-template/notification-template.hooks';
import { NotificationTemplateSelector } from '@components/form-controls/control-types/namespaced/notifications/notification-template/notification-template.styles';
import config, { TemplateMethod } from '@config/freeform/freeform.config';
import translate from '@ff-client/utils/translations';

import {
  PropertyEditorWrapper,
  SettingsWrapper,
} from '../property-editor/property-editor.styles';

export const NotificationManager: FC = () => {
  const currentPath = useResolvedPath('');
  const openModal = useNotificationEditModal();
  const { templates } = useNotificationTemplates('');

  const {
    templates: { canCreate, method },
  } = config;

  const openModalFunction = (): void => {
    openModal({ type: 'form' });
  };

  return (
    <PropertyEditorWrapper>
      <Breadcrumb
        id="notification-manager"
        label={translate('Manager')}
        url={currentPath.pathname}
      />

      <SettingsWrapper>
        <h1>{translate('Notification Manager')}</h1>

        <NotificationTemplateSelector>
          <Category
            value=""
            title={translate('Form Templates')}
            templates={templates.form}
            openEditOnClick
            onClick={() => {}}
            canCreate={canCreate && method !== TemplateMethod.Global}
            onCreate={openModalFunction}
          />
        </NotificationTemplateSelector>
      </SettingsWrapper>
    </PropertyEditorWrapper>
  );
};
