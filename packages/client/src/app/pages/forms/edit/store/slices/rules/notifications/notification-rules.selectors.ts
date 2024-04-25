import type { RootState } from '@editor/store';
import type { NotificationRule } from '@ff-client/types/rules';
import { createSelector } from '@reduxjs/toolkit';

export const notificationRuleSelectors = {
  isInitialized: (state: RootState): boolean =>
    state.rules.notifications.initialized,
  one: (uid: string) =>
    createSelector(
      (state: RootState) => state.rules.notifications.items,
      (items): NotificationRule => items.find((rule) => rule.uid === uid)
    ),
  hasRule: (uid: string) =>
    createSelector(
      (state: RootState) => state.rules.notifications.items,
      (items): boolean => Boolean(items.find((rule) => rule.uid === uid))
    ),
} as const;
