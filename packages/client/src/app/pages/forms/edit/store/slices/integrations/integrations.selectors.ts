import type { RootState } from '@editor/store';

import type { IntegrationEntry } from '.';

export const integrationSelectors = {
  one:
    (id: number) =>
    (state: RootState): IntegrationEntry =>
      state.integrations.find((item) => item.id === id),
} as const;
