import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import type {
  NotificationEntry,
  Value,
} from '@editor/store/slices/notifications';
import { modifyNotificationProperty } from '@editor/store/slices/notifications';
import type { Property } from '@ff-client/types/properties';

type Props = {
  notification: NotificationEntry;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ notification, property }) => {
  const dispatch = useAppDispatch();

  const { id } = notification;
  const { handle: key } = property;

  const updateValue: ControlTypes.UpdateValue<Value> = (value) => {
    dispatch(modifyNotificationProperty({ id, key, value }));
  };

  const value = notification.values[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      context={notification}
    />
  );
};
