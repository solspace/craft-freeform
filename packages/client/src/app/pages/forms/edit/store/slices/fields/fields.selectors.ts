import type { RootState } from '@editor/store';

import type { Field } from '.';

export const fieldSelectors = {
  all: (state: RootState): Field[] => state.fields,
  one:
    (uid: string) =>
    (state: RootState): Field =>
      state.fields.find((field) => field.uid === uid),
  hasErrors: (state: RootState): boolean =>
    Boolean(state.fields.find((field) => field.errors !== undefined)),
} as const;
