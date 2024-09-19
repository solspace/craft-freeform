import type { PageButton } from '@editor/builder/types/layout';
import { useAppDispatch, useAppSelector } from '@editor/store';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import type { Form } from '@ff-client/types/forms';

import type { Field } from '../layout/fields';

import { translationSelectors } from './translations.selectors';
import { translationActions } from '.';

type UseTranslations = {
  hasTranslation: (handle: string) => boolean;
  getTranslation: (handle: string, value: string) => string;
  updateTranslation: (handle: string, value: string) => void;
  removeTranslation: (handle: string) => void;
  willTranslate: () => boolean;
};

function useTranslations(field: Field): UseTranslations;
function useTranslations(form: Form): UseTranslations;
function useTranslations(button: PageButton): UseTranslations;
function useTranslations(target: Field | Form | PageButton): UseTranslations {
  const dispatch = useAppDispatch();
  const { current, isPrimary } = useSiteContext();

  const isField = 'properties' in target;
  const isForm = 'settings' in target;

  const translationNamespace = useAppSelector(
    translationSelectors.namespace.fields(
      current.id,
      isField || isForm ? target.uid : target.handle
    )
  );

  return {
    // ================
    //       HAS
    // ================
    hasTranslation: (handle) => !!translationNamespace?.[handle],
    willTranslate: () => !isPrimary,

    // ================
    //       GET
    // ================
    getTranslation: (handle, value) => {
      if (isPrimary) {
        return value;
      }

      if (!translationNamespace) {
        return value;
      }

      return translationNamespace[handle] || value;
    },

    // ================
    //      UPDATE
    // ================
    updateTranslation: (handle, value) => {
      if (isPrimary) {
        return;
      }

      const siteId = current.id;
      const type = isField ? 'fields' : isForm ? 'form' : 'buttons';
      const namespace = isField || isForm ? target.uid : target.handle;

      dispatch(
        translationActions.update({
          siteId,
          type,
          namespace,
          handle,
          value,
        })
      );
    },

    // ================
    //      REMOVE
    // ================
    removeTranslation: () => {},
  };
}

export { useTranslations };
