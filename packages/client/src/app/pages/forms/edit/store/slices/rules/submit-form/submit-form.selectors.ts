import type { RootState } from '@editor/store';
import type { SubmitFormRule } from '@ff-client/types/rules';

export const submitFormRuleSelectors = {
  one: (state: RootState): SubmitFormRule | undefined =>
    state.rules.submitForm.item,
  hasRule: (state: RootState): boolean => !!state.rules.submitForm.item,
} as const;
