import { useCallback } from 'react';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch, useAppSelector } from '@editor/store';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import { useFieldTypeSearch } from '@ff-client/queries/field-types';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import { useFetchPageButtonType } from '@ff-client/queries/page-types';
import type { SettingsNamespace } from '@ff-client/types/forms';

import type { Field } from '../layout/fields';

import { translationSelectors } from './translations.selectors';
import type { TranslationType } from './translations.types';
import { translationActions } from '.';

type HasTranslation = (handle: string) => boolean;
type GetTranslation = (handle: string, value: string) => string;
type UpdateTranslation = (handle: string, value: string) => void;
type RemoveTranslation = (handle: string) => void;
type WillTranslate = (handle: string) => boolean;

type UseTranslations = {
  hasTranslation: HasTranslation;
  getTranslation: GetTranslation;
  updateTranslation: UpdateTranslation;
  removeTranslation: RemoveTranslation;
  willTranslate: WillTranslate;
};

function useTranslations(field: Field): UseTranslations;
function useTranslations(form: SettingsNamespace): UseTranslations;
function useTranslations(page: Page): UseTranslations;
function useTranslations(
  target: Field | SettingsNamespace | Page
): UseTranslations {
  const dispatch = useAppDispatch();
  const { current, isPrimary } = useSiteContext();
  const searchType = useFieldTypeSearch();

  const { data: pageButtonType } = useFetchPageButtonType();
  const { data: formSettings } = useQueryFormSettings();

  const isField = target && 'typeClass' in target;
  const isForm = target && 'type' in target && target.type === 'settings';

  const siteId = current.id;
  const namespace = isForm ? target.namespace : target?.uid;
  const type: TranslationType = isField ? 'fields' : isForm ? 'form' : 'pages';

  const translationNamespace = useAppSelector(
    translationSelectors.namespace(current.id, target)
  );

  // ================
  //       HAS
  // ================
  const hasTranslation: HasTranslation = useCallback(
    (handle) => target && translationNamespace?.[handle] !== undefined,
    [translationNamespace]
  );

  const willTranslate: WillTranslate = useCallback(
    (handle) => {
      if (!target) {
        return false;
      }

      if (isPrimary) {
        return false;
      }

      if (isField) {
        const type = searchType(target.typeClass);
        if (!type) {
          return false;
        }

        return type.properties.find((prop) => prop.handle === handle)
          ?.translatable;
      }

      if (isForm) {
        const setting = formSettings?.find(
          (setting) => setting.handle === namespace
        );
        if (!setting) {
          return false;
        }

        return setting.properties.find((prop) => prop.handle === handle)
          ?.translatable;
      }

      if (handle === 'label') {
        return true;
      }

      return pageButtonType?.properties?.find((prop) => prop.handle === handle)
        ?.translatable;
    },
    [isField, isForm, isPrimary, searchType, target]
  );

  // ================
  //       GET
  // ================
  const getTranslation: GetTranslation = (handle, value) => {
    if (!willTranslate(handle)) {
      return value;
    }

    if (!hasTranslation(handle)) {
      return value;
    }

    return translationNamespace[handle];
  };

  // ================
  //      UPDATE
  // ================
  const updateTranslation: UpdateTranslation = (handle, value) => {
    if (!willTranslate(handle)) {
      return;
    }

    dispatch(
      translationActions.update({
        siteId,
        type,
        namespace,
        handle,
        value,
      })
    );
  };

  // ================
  //      REMOVE
  // ================
  const removeTranslation: RemoveTranslation = (handle) => {
    if (!willTranslate(handle)) {
      return;
    }

    dispatch(
      translationActions.remove({
        siteId,
        type,
        namespace,
        handle,
      })
    );
  };

  return {
    hasTranslation,
    willTranslate,
    getTranslation,
    updateTranslation,
    removeTranslation,
  };
}

export { useTranslations };
