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
    clear: (state) => {
      state.initialized = false;
      state.items.length = 0;
    },
    set: (state, action: PayloadAction<Notification[]>) => {
      state.initialized = true;
      state.items.length = 0;
      action.payload.forEach((notification) => {
        state.items.push(notification);
      });
    },
    toggle: (state, action: PayloadAction<string>) => {
      const notification = findNotification(state, action.payload);
      if (notification) {
        notification.enabled = !notification.enabled;
      }
    },
    modify: (state, action: PayloadAction<NotificationModificationPayload>) => {
      const { uid, key, value } = action.payload;
      const notification = findNotification(state, uid);
      if (notification) {
        notification[key] = value;
      }
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

      for (const notification of state.items) {
        notification.errors = payload?.[notification.uid];
      }
    },
    remove: (state, action: PayloadAction<string>) => {
      state.items.splice(
        state.items.findIndex(
          (notification) => notification.uid === action.payload
        ),
        1
      );
    },
  },
});

const { actions } = notificationsSlice;
export { actions as notificationActions };

export default notificationsSlice.reducer;
