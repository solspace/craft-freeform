import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import { useQueryNotificationTypes } from '@ff-client/queries/notifications';

import { EmptyEditor } from './empty-editor';
import { FieldComponent } from './field-component';
import { PropertyEditorWrapper } from './property-editor.styles';

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
      {properties
        .sort((a, b) => a.order - b.order)
        .map((property) => (
          <FieldComponent
            key={property.handle}
            notification={notification}
            property={property}
          />
        ))}
    </PropertyEditorWrapper>
  );
};
