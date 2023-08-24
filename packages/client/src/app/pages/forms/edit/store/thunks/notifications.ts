import type {
  Notification,
  NotificationType,
} from '@ff-client/types/notifications';
import type { GenericValue } from '@ff-client/types/properties';

import type { AppThunk } from '..';
import { notificationActions } from '../slices/notifications';
import { notificationSelectors } from '../slices/notifications/notifications.selectors';

export const addNewNotification =
  (notificationType: NotificationType, uid: string): AppThunk =>
  (dispatch, getState) => {
    const { className, properties, newInstanceName } = notificationType;

    const values: Record<string, GenericValue> = {};
    properties.forEach((property) => {
      values[property.handle] = property.value;
    });

    const count = notificationSelectors.count.ofType(className)(getState());
    const name = `${newInstanceName} notification ${count + 1}`;

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

export const removeNotification =
  (notification: Notification): AppThunk =>
  (dispatch) => {
    dispatch(notificationActions.remove(notification.uid));
  };
