import type { RootState } from '@editor/store';
import type { NotificationRule } from '@ff-client/types/rules';

export const notificationRuleSelectors = {
  isInitialized: (state: RootState): boolean =>
    state.rules.notifications.initialized,
  one:
    (uid: string) =>
    (state: RootState): NotificationRule | undefined =>
      state.rules.notifications.items.find((rule) => rule.uid === uid),
  hasRule:
    (uid: string) =>
    (state: RootState): boolean =>
      !!state.rules.notifications.items.find(
        (rule) => rule.notification === uid
      ),
} as const;
