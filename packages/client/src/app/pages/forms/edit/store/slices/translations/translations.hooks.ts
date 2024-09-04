import type { PageButton } from '@editor/builder/types/layout';
import { useAppDispatch, useAppSelector } from '@editor/store';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import type { Form } from '@ff-client/types/forms';

import type { Field } from '../layout/fields';

import { translationSelectors } from './translations.selectors';
import { translationActions } from '.';

type UseTranslations = {
  has: (handle: string) => boolean;
  get: (handle: string, value: string) => string;
  update: (handle: string, value: string) => void;
  remove: (handle: string) => void;
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
    has: (handle) => !!translationNamespace?.[handle],

    // ================
    //       GET
    // ================
    get: (handle, value) => {
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
    update: (handle, value) => {
      if (isPrimary) {
        return;
      }

      dispatch(
        translationActions.update({
          siteId: current.id,
          type: isField ? 'fields' : isForm ? 'form' : 'buttons',
          namespace: isField ? target.uid : isForm ? target.uid : target.handle,
          handle,
          value,
        })
      );
    },

    // ================
    //      REMOVE
    // ================
    remove: () => {},
  };
}

export { useTranslations };
