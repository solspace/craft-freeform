import type { RootState } from '@editor/store';

import type { SearchType } from '.';

export const searchSelectors = {
  query:
    (type: keyof SearchType) =>
    (state: RootState): string =>
      state.search[type],
} as const;
