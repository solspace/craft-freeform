import type { RootState } from '@editor/store';
import type { SubmitFormRule } from '@ff-client/types/rules';

export const submitFormRuleSelectors = {
  one: (state: RootState): SubmitFormRule => state.rules.submitForm.item,
  hasRule: (state: RootState): boolean => Boolean(state.rules.submitForm.item),
} as const;
