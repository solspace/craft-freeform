import type { RootState } from '@editor/store';

import type { NotificationInstance } from './notifications.types';

export const notificationSelectors = {
  all: (state: RootState): NotificationInstance[] => state.notifications,
  one:
    (uid: string) =>
    (state: RootState): NotificationInstance =>
      state.notifications.find((notification) => notification.uid === uid),
  errors: {
    any: (state: RootState): boolean =>
      Boolean(
        state.notifications.find(
          (notification) => notification.errors !== undefined
        )
      ),
  },
} as const;
