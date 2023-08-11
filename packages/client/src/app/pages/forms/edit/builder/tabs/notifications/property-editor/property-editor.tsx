import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import { useQueryNotificationTypes } from '@ff-client/queries/notifications';

import { Remove } from './remove-button/remove';
import { EmptyEditor } from './empty-editor';
import { FieldComponent } from './field-component';
import {
  PropertyEditorWrapper,
  SettingsWrapper,
} from './property-editor.styles';

type UrlParams = {
  uid: string;
  formId: string;
};

export const PropertyEditor: React.FC = () => {
  const { uid } = useParams<UrlParams>();
  const { data: notificationTypes } = useQueryNotificationTypes();

  const notification = useSelector(notificationSelectors.one(uid));
  if (!notification) {
    return <EmptyEditor />;
  }

  const properties =
    notificationTypes?.find((type) => type.className === notification.className)
      ?.properties || [];

  return (
    <PropertyEditorWrapper>
      <Remove notification={notification} />
      <SettingsWrapper>
        {properties.map((property) => (
          <FieldComponent
            key={property.handle}
            notification={notification}
            property={property}
          />
        ))}
      </SettingsWrapper>
    </PropertyEditorWrapper>
  );
};
