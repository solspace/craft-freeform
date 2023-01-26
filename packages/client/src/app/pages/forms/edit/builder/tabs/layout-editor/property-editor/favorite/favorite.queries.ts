import type { UseMutationResult } from 'react-query';
import { useMutation } from 'react-query';
import type { Field } from '@editor/store/slices/fields';
import type { APIError } from '@ff-client/types/api';
import type { FieldType } from '@ff-client/types/properties';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

type Variables = {
  field: Field;
  type: FieldType;
};

type FavoritesMutation = (
  variables: Variables
) => Promise<AxiosResponse<FieldType>>;

const favoritesMutation: FavoritesMutation = ({ field, type }) => {
  const payload: FieldType = {
    ...type,
    properties: type.properties.map((property) => {
      const value = field.properties[property.handle];

      return {
        ...property,
        value,
      };
    }),
  };

  return axios.post<FieldType>('/client/api/favorites', payload);
};

export type FavoriteMutationResult = UseMutationResult<
  AxiosResponse<FieldType>,
  APIError,
  Variables
>;

export const useFavoritesMutation = (): FavoriteMutationResult => {
  return useMutation<AxiosResponse<FieldType>, APIError, Variables, unknown>(
    favoritesMutation
  );
};
