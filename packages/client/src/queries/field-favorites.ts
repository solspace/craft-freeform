import type { FieldFavorite } from '@ff-client/types/fields';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const QKFavorites = {
  all: ['field-favorites'] as const,
};

type FetchFavoritesQuery = (options?: {
  select?: (data: FieldFavorite[]) => FieldFavorite[];
}) => UseQueryResult<FieldFavorite[], AxiosError>;

export const useFetchFavorites: FetchFavoritesQuery = ({ select } = {}) =>
  useQuery<FieldFavorite[], AxiosError>(
    QKFavorites.all,
    () =>
      axios
        .get<FieldFavorite[]>(`/api/fields/favorites`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      select,
    }
  );
