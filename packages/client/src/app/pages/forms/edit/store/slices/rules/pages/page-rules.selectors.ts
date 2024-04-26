import type { RootState } from '@editor/store';
import type { PageRule } from '@ff-client/types/rules';
import { createSelector } from '@reduxjs/toolkit';

export const pageRuleSelectors = {
  one: (pageUid: string) =>
    createSelector(
      (state: RootState) => state.rules.pages.items,
      (items): PageRule => items.find((rule) => rule.page === pageUid)
    ),
  hasRule: (pageUid: string) =>
    createSelector(
      (state: RootState) => state.rules.pages.items,
      (items): boolean => Boolean(items.find((rule) => rule.page === pageUid))
    ),
  hasFieldInRule: (fieldUid: string) =>
    createSelector(
      (state: RootState) => state.rules.fields.items,
      (fields): boolean =>
        Boolean(
          fields.find((rule) =>
            rule.conditions.some((condition) => condition.field === fieldUid)
          )
        )
    ),
} as const;
