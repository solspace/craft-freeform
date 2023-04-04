import type { NotificationType } from '@ff-client/types/notifications';
import type { GenericValue } from '@ff-client/types/properties';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

import type { AppThunk } from '..';
import { add } from '../slices/notifications';

export const addNewNotification =
  (notificationType: NotificationType, uid: string): AppThunk =>
  (dispatch) => {
    const { class: className, properties, newInstanceName } = notificationType;

    const values: Record<string, GenericValue> = {};
    properties.forEach((property) => {
      values[property.handle] = property.value;
    });

    const uniqueNames = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: ' ',
      style: 'capital',
    });

    const name = `${newInstanceName} ${uniqueNames}`;

    dispatch(
      add({
        uid,
        class: className,
        enabled: true,
        ...values,
        name,
      })
    );
  };
