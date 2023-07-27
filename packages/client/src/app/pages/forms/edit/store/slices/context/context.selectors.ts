import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import { hasErrors } from '@ff-client/utils/errors';

import type { Focus, State } from '.';

export const contextSelectors = {
  currentPage: (state: RootState): Page | undefined => {
    const pageUid = state.context.page;
    if (pageUid) {
      return state.layout.pages.find((page) => page.uid === pageUid);
    }

    return state.layout.pages.find(Boolean);
  },
  hasErrors:
    (uid: string) =>
    (state: RootState): boolean => {
      const pageHasErrors = false;

      const layoutUid = state.layout.pages.find(
        (page) => page.uid === uid
      ).layoutUid;

      state.layout.rows
        .filter((row) => row.layoutUid === layoutUid)
        .some((row) =>
          state.layout.fields
            .filter((field) => field.rowUid === row.uid)
            .some((field) => hasErrors(field.errors))
        );

      return pageHasErrors;
    },
  focus: (state: RootState): Focus => state.context.focus,
  state: (state: RootState): State => state.context.state,
} as const;
