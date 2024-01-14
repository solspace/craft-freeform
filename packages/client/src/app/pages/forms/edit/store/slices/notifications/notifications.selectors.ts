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
  isFieldInEmailNotification:
    (field: string) =>
    (state: RootState): boolean =>
      state.notifications.items.some(
        (notification) =>
          notification.className ===
            'Solspace\\Freeform\\Notifications\\Types\\EmailField\\EmailField' &&
          notification.field === field
      ),
  count: {
    all: (state: RootState): number => state.notifications.items.length,
    ofType:
      (className: string) =>
      (state: RootState): number =>
        state.notifications.items.filter(
          (notification) => notification.className === className
        ).length,
  },
  errors: {
    any: (state: RootState): boolean =>
      Boolean(
        state.notifications.items.find(
          (notification) => notification.errors !== undefined
        )
      ),
  },
} as const;
