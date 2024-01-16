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
      state.notifications.items.some((notification) => {
        if (notification?.rule) {
          const rule = state.rules.notifications.items.find(
            (rule) => rule.uid === notification.rule
          );

          return (
            (rule?.enabled &&
              rule.conditions.some((condition) => condition.field === field)) ||
            false
          );
        }

        return notification.field === field && notification.enabled;
      }),
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
