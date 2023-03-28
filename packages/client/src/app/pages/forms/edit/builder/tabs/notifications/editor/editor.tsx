import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectNotification } from '@editor/store/slices/notifications';
import { useQueryNotificationTypes } from '@ff-client/queries/notifications';

import { EmptyEditor } from './editor.empty';
import { PropertyEditorWrapper } from './editor.styles';
import { FieldComponent } from './field-component';

type UrlParams = {
  id: string;
  formId: string;
};

export const PropertyEditor: React.FC = () => {
  const { id } = useParams<UrlParams>();
  const { data: notificationTypes } = useQueryNotificationTypes();

  const notification = useSelector(selectNotification(Number(id)));
  if (!notification) {
    return <EmptyEditor />;
  }
  const properties =
    notificationTypes?.find((type) => type.class === notification.class)
      ?.properties || [];

  return (
    <PropertyEditorWrapper>
      {properties.map((property) => (
        <FieldComponent
          key={property.handle}
          notification={notification}
          property={property}
        />
      ))}
    </PropertyEditorWrapper>
  );
};
