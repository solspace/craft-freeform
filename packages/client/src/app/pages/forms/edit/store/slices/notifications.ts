import type { RootState } from '@editor/store';
import type { Notification } from '@ff-client/types/notifications';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { SaveSubscriber } from '../middleware/state-persist';
import { TOPIC_SAVE } from '../middleware/state-persist';

type NotificationModificationPayload = {
  id: number;
  key: string;
  value: GenericValue;
};

const initialState: Notification[] = [];

const findNotification = (
  state: Notification[],
  id: number
): Notification | undefined => {
  return state.find((item) => item.id === id);
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
    toggle: (state, action: PayloadAction<number>) => {
      const notification = findNotification(state, action.payload);
      notification.enabled = !notification.enabled;
    },
    modify: (state, action: PayloadAction<NotificationModificationPayload>) => {
      const { id, key, value } = action.payload;
      const notification = findNotification(state, id);
      notification[key] = value;
    },
  },
});

export const { set, toggle, modify } = notificationsSlice.actions;

export const selectNotification =
  (id: number) =>
  (state: RootState): Notification =>
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
