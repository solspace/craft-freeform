import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { SettingsNamespace } from '@ff-client/types/forms';
import { createSelector } from '@reduxjs/toolkit';

import type { Field } from '../layout/fields';

import type { TranslationType } from './translations.types';

export const translationSelectors = {
  namespace: (siteId: number, target: Field | SettingsNamespace | Page) =>
    createSelector(
      (state: RootState) => state.translations?.[siteId],
      (translations) => {
        if (!target) {
          return undefined;
        }

        let type: TranslationType;
        let namespace: string = target?.uid;
        if ('properties' in target) {
          type = 'fields';
        } else if ('type' in target && target.type === 'settings') {
          type = 'form';
          namespace = target.namespace;
        } else {
          type = 'pages';
        }

        return translations?.[type]?.[namespace];
      }
    ),
} as const;
