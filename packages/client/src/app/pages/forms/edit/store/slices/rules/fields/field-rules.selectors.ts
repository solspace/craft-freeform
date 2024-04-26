import type { RootState } from '@editor/store';
import type { FieldRule } from '@ff-client/types/rules';
import { createSelector } from '@reduxjs/toolkit';

export const fieldRuleSelectors = {
  one: (fieldUid: string) =>
    createSelector(
      (state: RootState) => state.rules.fields.items,
      (fields): FieldRule | undefined =>
        fields.find((rule) => rule.field === fieldUid)
    ),
  isInCondition: (fieldUid: string) =>
    createSelector(
      (state: RootState) => state.rules.fields.items,
      (state: RootState) => state.rules.pages.items,
      (state: RootState) => state.rules.submitForm.item,
      (state: RootState) => state.rules.buttons.items,
      (fields, pages, submitForm, buttons): boolean =>
        fields.some((rule) =>
          rule.conditions.some((condition) => condition.field === fieldUid)
        ) ||
        pages.some((rule) =>
          rule.conditions.some((condition) => condition.field === fieldUid)
        ) ||
        submitForm?.conditions.some(
          (condition) => condition.field === fieldUid
        ) ||
        buttons.some((rule) =>
          rule.conditions.some((condition) => condition.field === fieldUid)
        )
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
  hasRule: (fieldUid: string) =>
    createSelector(
      (state: RootState) => state.rules.fields.items,
      (fields): boolean =>
        Boolean(fields.find((rule) => rule.field === fieldUid))
    ),
} as const;
