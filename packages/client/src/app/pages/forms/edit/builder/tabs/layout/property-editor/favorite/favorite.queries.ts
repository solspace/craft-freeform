import type { UseMutationResult } from 'react-query';
import { useQueryClient } from 'react-query';
import { useMutation } from 'react-query';
import type { Field } from '@editor/store/slices/fields';
import { QKFavorites } from '@ff-client/queries/field-favorites';
import type { APIError } from '@ff-client/types/api';
import type { PropertyValueCollection } from '@ff-client/types/fields';
import type { FieldType } from '@ff-client/types/properties';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

type Variables = {
  label: string;
  field: Field;
  type: FieldType;
};

type Payload = {
  label: string;
  typeClass: string;
  properties: PropertyValueCollection;
};

type FavoritesMutation = (variables: Variables) => Promise<AxiosResponse>;

const favoritesMutation: FavoritesMutation = ({ label, field, type }) => {
  const payload: Payload = {
    label,
    properties: field.properties,
    typeClass: type.typeClass,
  };

  return axios.post('/api/fields/favorites', payload);
};

export type FavoriteMutationResult = UseMutationResult<
  AxiosResponse<FieldType>,
  APIError,
  Variables
>;

export const useFavoritesMutation = (): FavoriteMutationResult => {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, APIError, Variables, unknown>(
    favoritesMutation,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QKFavorites.all });
      },
    }
  );
};
