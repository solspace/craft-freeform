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
  isInCondition:
    (fieldUid: string) =>
    (state: RootState): boolean =>
      state.rules.fields.items.some((rule) =>
        rule.conditions.some((condition) => condition.field === fieldUid)
      ) ||
      state.rules.pages.items.some((rule) =>
        rule.conditions.some((condition) => condition.field === fieldUid)
      ) ||
      state.rules.submitForm.item?.conditions.some(
        (condition) => condition.field === fieldUid
      ),
  usedByFields: (fieldUid: string) =>
    createSelector(
      (state: RootState) => state.rules.fields.items,
      (fields) => {
        const usedInfieldsUids = fields
          .filter((rule) =>
            rule.conditions.some((condition) => condition.field === fieldUid)
          )
          .map((rule) => rule.field);

        return usedInfieldsUids;
      }
    ),
  hasRule:
    (fieldUid: string) =>
    (state: RootState): boolean =>
      !!state.rules.fields.items.find((rule) => rule.field === fieldUid),
} as const;
