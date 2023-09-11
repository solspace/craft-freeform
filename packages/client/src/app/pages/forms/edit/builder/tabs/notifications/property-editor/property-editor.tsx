import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import {
  useQueryFormNotifications,
  useQueryNotificationTypes,
} from '@ff-client/queries/notifications';

import { Remove } from './remove-button/remove';
import { FieldComponent } from './field-component';
import { EmptyEditor } from './property-editor.empty';
import { LoadingEditor } from './property-editor.loading';
import {
  PropertyEditorWrapper,
  SettingsWrapper,
} from './property-editor.styles';

type UrlParams = {
  uid: string;
  formId: string;
};

export const PropertyEditor: React.FC = () => {
  const { formId, uid } = useParams<UrlParams>();
  const { data: notificationTypes } = useQueryNotificationTypes();

  const { data, isFetching } = useQueryFormNotifications(
    formId ? Number(formId) : undefined
  );

  const notification = useSelector(notificationSelectors.one(uid));

  if (!data && isFetching) {
    return <LoadingEditor />;
  }

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
