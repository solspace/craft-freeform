import React, { useEffect, useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalType } from '@components/modals/modal.types';
import {
  useFavoritesDeleteMutation,
  useFavoritesUpdateMutation,
} from '@editor/builder/tabs/layout/property-editor/editors/fields/favorite/favorite.queries';
import { useFetchFavorites } from '@ff-client/queries/field-favorites';
import type { ErrorList } from '@ff-client/types/api';
import type {
  FieldFavorite,
  PropertyValueCollection,
} from '@ff-client/types/fields';
import translate from '@ff-client/utils/translations';

import { FavoritesEditor } from './modal.editor';
import { FavoriteListItem } from './modal.list-item';
import {
  FavoritesEditorWrapper,
  FavoritesWrapper,
  FieldList,
} from './modal.styles';

export const CreateModal: ModalType = ({ closeModal }) => {
  const { data } = useFetchFavorites();

  const [focusedField, setFocusedField] = useState<FieldFavorite>();
  const [state, setState] = useState<PropertyValueCollection>({});
  const [errors, setErrors] = useState<ErrorList>();
  const [loaded, setLoaded] = useState(false);

  const updateMutation = useFavoritesUpdateMutation({
    onSuccess: () => {
      closeModal();
    },
    onError: (error) => {
      setErrors(error.errors);
    },
  });

  const deleteMutation = useFavoritesDeleteMutation({
    onSuccess: (_, deletedId) => {
      const next = data.filter((favorite) => favorite.id !== deletedId)?.at(0);
      if (next) {
        setFocusedField(next);
      } else {
        closeModal();
      }
    },
  });

  useEffect(() => {
    if (!data || loaded) {
      return;
    }

    setLoaded(true);
    setFocusedField(data?.[0]);

    const collection: Record<number, PropertyValueCollection> = {};
    data.forEach((favorite) => {
      collection[favorite.id] = favorite.properties;
    });

    setState(collection);
  }, [data]);

  const isLoading = updateMutation.isLoading || deleteMutation.isLoading;

  return (
    <ModalContainer style={{ maxWidth: '70%' }}>
      <ModalHeader>
        <h1>{translate('Favorite Fields')}</h1>
      </ModalHeader>
      <FavoritesWrapper>
        <FieldList>
          {data.map((favorite) => (
            <FavoriteListItem
              key={favorite.id}
              favorite={favorite}
              label={state?.[favorite.id]?.label || favorite.label}
              errors={errors?.[favorite.id]}
              isActive={focusedField?.id === favorite.id}
              onClick={() => setFocusedField(favorite)}
              onDelete={() => {
                if (
                  confirm(
                    `Are you sure you wish to delete the "${favorite.label}" field?`
                  )
                ) {
                  deleteMutation.mutate(favorite.id);
                }
              }}
            />
          ))}
        </FieldList>
        <FavoritesEditorWrapper>
          {focusedField && (
            <FavoritesEditor
              field={focusedField}
              values={state?.[focusedField.id]}
              errors={errors?.[focusedField.id]}
              updateValueCallback={(key: string, value: string) => {
                setState((prevState) => ({
                  ...prevState,
                  [focusedField.id]: {
                    ...prevState[focusedField.id],
                    [key]: value,
                  },
                }));
              }}
            />
          )}
        </FavoritesEditorWrapper>
      </FavoritesWrapper>
      <ModalFooter>
        <button
          type="button"
          className="btn"
          onClick={closeModal}
          disabled={isLoading}
        >
          {translate('Cancel')}
        </button>
        <button
          type="button"
          className="btn submit"
          disabled={isLoading}
          onClick={() => updateMutation.mutate(state)}
        >
          <LoadingText
            loadingText={translate('Saving')}
            loading={isLoading}
            spinner
          >
            {translate('Save')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
