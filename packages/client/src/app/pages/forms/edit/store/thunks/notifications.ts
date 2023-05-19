import type { NotificationType } from '@ff-client/types/notifications';
import type { GenericValue } from '@ff-client/types/properties';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

import type { AppThunk } from '..';
import { notificationActions } from '../slices/notifications';

export const addNewNotification =
  (notificationType: NotificationType, uid: string): AppThunk =>
  (dispatch) => {
    const {
      className: className,
      properties,
      newInstanceName,
    } = notificationType;

    const values: Record<string, GenericValue> = {};
    properties.forEach((property) => {
      values[property.handle] = property.value;
    });

    const name = uniqueNamesGenerator({
      dictionaries: [adjectives, [newInstanceName], animals],
      separator: ' ',
      style: 'capital',
    });

    dispatch(
      notificationActions.add({
        uid,
        className: className,
        enabled: true,
        ...values,
        name,
      })
    );
  };
