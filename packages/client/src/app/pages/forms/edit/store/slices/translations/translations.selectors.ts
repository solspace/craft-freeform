import type { RootState } from '@editor/store';

import type { TranslationItems } from './translations.types';

export const translationSelectors = {
  namespace: {
    fields:
      (siteId: number, namespace: string) =>
      (state: RootState): TranslationItems | undefined =>
        state.translations[siteId]?.fields?.[namespace],
  },
} as const;
