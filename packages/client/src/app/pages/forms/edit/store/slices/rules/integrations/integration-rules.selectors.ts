import type { RootState } from '@editor/store';
import type { IntegrationRule } from '@ff-client/types/rules';
import { createSelector } from '@reduxjs/toolkit';

export const integrationRuleSelectors = {
  isInitialized: (state: RootState): boolean =>
    state.rules.integrations.initialized,
  one: (uid: string) =>
    createSelector(
      (state: RootState) => state.rules.integrations.items,
      (items): IntegrationRule => items.find((rule) => rule.uid === uid)
    ),
  hasRule: (uid: string) =>
    createSelector(
      (state: RootState) => state.rules.integrations.items,
      (items): boolean => Boolean(items.find((rule) => rule.uid === uid))
    ),
} as const;
