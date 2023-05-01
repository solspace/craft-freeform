import type { RootState } from '@editor/store';
import type { PageRule } from '@ff-client/types/rules';

export const pageRuleSelectors = {
  one:
    (pageUid: string) =>
    (state: RootState): PageRule | undefined =>
      state.rules.pages.find((rule) => rule.page === pageUid),
  hasRule:
    (pageUid: string) =>
    (state: RootState): boolean =>
      !!state.rules.pages.find((rule) => rule.page === pageUid),
} as const;
