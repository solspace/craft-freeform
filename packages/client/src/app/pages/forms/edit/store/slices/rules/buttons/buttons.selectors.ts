import type { RootState } from '@editor/store';
import type { ButtonRule, PageButtonType } from '@ff-client/types/rules';
import { createSelector } from '@reduxjs/toolkit';

export const buttonRuleSelectors = {
  one:
    (pageUid: string, button: PageButtonType) =>
    (state: RootState): ButtonRule | undefined =>
      state.rules.buttons?.items?.find(
        (rule) => rule.page === pageUid && rule.button === button
      ),
  hasRule: (pageUid: string, button: PageButtonType) =>
    createSelector(
      (state: RootState) => state.rules.buttons.items,
      (rules): boolean =>
        Boolean(
          rules.find((rule) => rule.page === pageUid && rule.button === button)
        )
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
