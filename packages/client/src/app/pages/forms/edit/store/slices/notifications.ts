import type { RootState } from '@editor/store';
import type { Notification } from '@ff-client/types/notifications';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { SaveSubscriber } from '../middleware/state-persist';
import { TOPIC_SAVE } from '../middleware/state-persist';

type NotificationModificationPayload = {
  uid: string;
  key: string;
  value: GenericValue;
};

const initialState: Notification[] = [];

const findNotification = (
  state: Notification[],
  uid: string
): Notification | undefined => {
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
  },
});

export const { set, toggle, modify, add } = notificationsSlice.actions;

export const selectNotifications = (state: RootState): Notification[] =>
  state.notifications;

export const selectNotification =
  (uid: string) =>
  (state: RootState): Notification =>
    state.notifications.find((notification) => notification.uid === uid);

export default notificationsSlice.reducer;

const persistNotifications: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.notifications = state.notifications;
};

PubSub.subscribe(TOPIC_SAVE, persistNotifications);
