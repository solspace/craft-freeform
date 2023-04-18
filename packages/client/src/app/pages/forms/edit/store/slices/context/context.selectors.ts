import type { Page } from '@editor/builder/types/layout';
import { CellType } from '@editor/builder/types/layout';
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
      let pageHasErrors = false;

      const fieldUidsWithErrors = state.fields
        .filter((field) => hasErrors(field.errors))
        .map((field) => field.uid);

      const layoutUid = state.layout.pages.find(
        (page) => page.uid === uid
      ).layoutUid;

      state.layout.rows
        .filter((row) => row.layoutUid === layoutUid)
        .forEach((row) => {
          if (pageHasErrors) {
            return;
          }

          const cells = state.layout.cells.filter(
            (cell) => cell.rowUid === row.uid
          );

          cells.forEach((cell) => {
            if (
              cell.type === CellType.Field &&
              fieldUidsWithErrors.includes(cell.targetUid)
            ) {
              pageHasErrors = true;
            }
          });
        });

      return pageHasErrors;
    },
  focus: (state: RootState): Focus => state.context.focus,
  state: (state: RootState): State => state.context.state,
} as const;
