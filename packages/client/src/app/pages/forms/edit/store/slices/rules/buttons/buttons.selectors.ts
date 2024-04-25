import type { RootState } from '@editor/store';
import type { ButtonRule, PageButtonType } from '@ff-client/types/rules';

export const buttonRuleSelectors = {
  one:
    (pageUid: string, button: PageButtonType) =>
    (state: RootState): ButtonRule | undefined =>
      state.rules.buttons?.items?.find(
        (rule) => rule.page === pageUid && rule.button === button
      ),
  hasRule:
    (pageUid: string, button: PageButtonType) =>
    (state: RootState): boolean =>
      !!state.rules.buttons.items.find(
        (rule) => rule.page === pageUid && rule.button === button
      ),
} as const;
