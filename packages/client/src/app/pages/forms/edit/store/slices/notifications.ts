import type { RootState } from '@editor/store';
import type { Notification } from '@ff-client/types/notifications';
import type { Property } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { SaveSubscriber } from '../middleware/state-persist';
import { TOPIC_SAVE } from '../middleware/state-persist';

export type Value = string | number | boolean;

export type NotificationEntry = {
  values: { [key: string]: Value };
  dirtyValues: { [key: string]: Value };
} & Notification;

type NotificationModificationPayload = {
  id: number;
  key: string;
  value: Value;
};

const initialState: NotificationEntry[] = [];

const findNotification = (
  state: NotificationEntry[],
  id: number
): NotificationEntry | undefined => {
  return state.find((item) => item.id === id);
};

const findProperty = (
  notification: NotificationEntry,
  key: string
): Property | undefined => {
  return notification.properties.find((property) => property.handle === key);
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      action.payload.forEach((notification) => {
        const values: { [key: string]: Value } = {};
        notification.properties.forEach((property) => {
          values[property.handle] = property.value;
        });

        state.push({
          dirtyValues: {},
          values,
          ...notification,
        });
      });
    },
    toggleNotification: (state, action: PayloadAction<number>) => {
      const notification = findNotification(state, action.payload);
      notification.enabled = !notification.enabled;
    },
    modifyNotificationProperty: (
      state,
      action: PayloadAction<NotificationModificationPayload>
    ) => {
      const { id, key, value } = action.payload;
      const notification = findNotification(state, id);
      const property = findProperty(notification, key);

      notification.values[key] = value;
      notification.dirtyValues = {
        ...notification.dirtyValues,
        [key]: value,
      };

      if (
        notification.dirtyValues[key] !== undefined &&
        notification.dirtyValues[key] === property.value
      ) {
        delete notification.dirtyValues[key];
      }
    },
  },
});

export const {
  addNotifications,
  toggleNotification,
  modifyNotificationProperty,
} = notificationsSlice.actions;

export const selectNotification =
  (id: number) =>
  (state: RootState): NotificationEntry =>
    state.notifications.find((notification) => notification.id === id);

export default notificationsSlice.reducer;

const persistNotifications: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.notifications = state.notifications.map((notification) => ({
    id: notification.id,
    enabled: Boolean(notification.enabled),
    values: notification.dirtyValues,
  }));
};

PubSub.subscribe(TOPIC_SAVE, persistNotifications);
