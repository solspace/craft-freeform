import type { RootState } from '@editor/store';
import type { Form, SettingsNamespace } from '@ff-client/types/forms';

import type { FormErrors } from './form.types';

export const formSelectors = {
  current: (state: RootState): Form | undefined => state.form,
  settings: {
    all:
      (namespace: string) =>
      (state: RootState): SettingsNamespace =>
        state.form.settings?.[namespace] || {},
    one:
      (namespace: string, key: string) =>
      (state: RootState): any =>
        state.form.settings?.[namespace]?.[key],
  },
  errors: (state: RootState): FormErrors => state.form.errors,
} as const;
