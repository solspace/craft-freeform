import type { RootState } from '@editor/store';

import type { NotificationInstance } from './notifications.types';

export const notificationSelectors = {
  all: (state: RootState): NotificationInstance[] => state.notifications.items,
  one:
    (uid: string) =>
    (state: RootState): NotificationInstance =>
      state.notifications.items.find(
        (notification) => notification.uid === uid
      ),
  errors: {
    any: (state: RootState): boolean =>
      Boolean(
        state.notifications.items.find(
          (notification) => notification.errors !== undefined
        )
      ),
  },
} as const;
