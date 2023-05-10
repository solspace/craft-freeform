import type { Notification } from '@ff-client/types/notifications';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import './notifications.persistence';

import type {
  ErrorPayload,
  NotificationInstance,
  NotificationModificationPayload,
} from './notifications.types';

type NotificationState = {
  initialized: boolean;
  items: NotificationInstance[];
};

const initialState: NotificationState = {
  initialized: false,
  items: [],
};

const findNotification = (
  state: NotificationState,
  uid: string
): NotificationInstance | undefined => {
  return state.items.find((item) => item.uid === uid);
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Notification[]>) => {
      state.initialized = true;
      state.items.length = 0;
      action.payload.forEach((notification) => {
        state.items.push(notification);
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
      state.items.push(action.payload);
    },
    clearErrors: (state) => {
      for (const notification of state.items) {
        notification.errors = undefined;
      }
    },
    setErrors: (state, action: PayloadAction<ErrorPayload>) => {
      const { payload } = action;

      for (const notificaion of state.items) {
        notificaion.errors = payload?.[notificaion.uid];
      }
    },
  },
});

const { actions } = notificationsSlice;
export { actions as notificationActions };

export default notificationsSlice.reducer;
