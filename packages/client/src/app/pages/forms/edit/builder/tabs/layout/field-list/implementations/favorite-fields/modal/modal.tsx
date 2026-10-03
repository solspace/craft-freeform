import { LoadingText } from "@components/loaders/loading-text/loading-text";
import { useModal } from "@components/modals/modal.context";
import type { ModalType } from "@components/modals/modal.types";
import {
  SlideoutContainer,
  SlideoutFooter,
  SlideoutHeader,
} from "@components/slideouts/slideout.styles";
import {
  useFavoritesDeleteMutation,
  useFavoritesUpdateMutation,
} from "@editor/builder/tabs/layout/property-editor/editors/fields/favorite/favorite.queries";
import { useFetchFavorites } from "@ff-client/queries/field-favorites";
import type { ErrorList } from "@ff-client/types/api";
import type {
  FieldFavorite,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import { useEffect, useState } from "react";

import { FavoritesEditor } from "./modal.editor";
import { FavoriteListItem } from "./modal.list-item";
import {
  FavoritesEditorWrapper,
  FavoritesWrapper,
  FieldList,
} from "./modal.styles";

export const FavoriteFieldsManagerModal: ModalType = ({ closeModal }) => {
  const { data } = useFetchFavorites();
  const { confirmDelete } = useModal();

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
    onSuccess: (_, deletedId: number) => {
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
  }, [data, loaded]);

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <SlideoutContainer>
      <SlideoutHeader>
        <h1>{translate("Favorite Fields")}</h1>
      </SlideoutHeader>
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
                if (isLoading) return;
                confirmDelete({
                  title: translate("Delete favorite field?"),
                  message: translate(
                    'Are you sure you want to delete the favorite field "{name}"? Fields already added to forms will not be affected.',
                    { name: state?.[favorite.id]?.label || favorite.label },
                  ),
                  onConfirm: () => {
                    deleteMutation.mutate(favorite.id);
                  },
                });
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
      <SlideoutFooter>
        <button
          type="button"
          className="btn"
          onClick={closeModal}
          disabled={isLoading}
        >
          {translate("Cancel")}
        </button>
        <button
          type="button"
          className="btn submit"
          disabled={isLoading}
          onClick={() => updateMutation.mutate(state)}
        >
          <LoadingText
            loadingText={translate("Saving")}
            loading={isLoading}
            spinner
          >
            {translate("Save")}
          </LoadingText>
        </button>
      </SlideoutFooter>
    </SlideoutContainer>
  );
};
