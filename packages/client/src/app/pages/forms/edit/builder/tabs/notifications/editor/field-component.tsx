import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { modify } from '@editor/store/slices/notifications';
import type { Notification } from '@ff-client/types/notifications';
import type { GenericValue, Property } from '@ff-client/types/properties';

type Props = {
  notification: Notification;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ notification, property }) => {
  const dispatch = useAppDispatch();

  const { uid } = notification;
  const { handle: key } = property;

  const updateValue: ControlTypes.UpdateValue<GenericValue> = (value) => {
    dispatch(modify({ uid, key, value }));
  };

  const value = notification?.[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      context={notification}
    />
  );
};
