import type { Notification } from '@ff-client/types/notifications';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import './notifications.persistence';

import type {
  ErrorPayload,
  NotificationInstance,
  NotificationModificationPayload,
} from './notifications.types';

const initialState: NotificationInstance[] = [];

const findNotification = (
  state: NotificationInstance[],
  uid: string
): NotificationInstance | undefined => {
  return state.find((item) => item.uid === uid);
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Notification[]>) => {
      state.length = 0;
      action.payload.forEach((notification) => {
        state.push(notification);
      });
    },
    toggle: (state, action: PayloadAction<string>) => {
      const notification = findNotification(state, action.payload);
      notification.enabled = !notification.enabled;
    },
    modify: (state, action: PayloadAction<NotificationModificationPayload>) => {
      const { uid, key, value } = action.payload;
      const notification = findNotification(state, uid);
      notification[key] = value;
    },
    add: (state, action: PayloadAction<Notification>) => {
      state.push(action.payload);
    },
    clearErrors: (state) => {
      for (const notification of state) {
        notification.errors = undefined;
      }
    },
    setErrors: (state, action: PayloadAction<ErrorPayload>) => {
      const { payload } = action;

      for (const notificaion of state) {
        notificaion.errors = payload?.[notificaion.uid];
      }
    },
  },
});

const { actions } = notificationsSlice;
export { actions as notificationActions };

export default notificationsSlice.reducer;
