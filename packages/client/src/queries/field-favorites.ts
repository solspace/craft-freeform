import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import type { FieldFavorite } from '@ff-client/types/fields';
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
        .get<FieldFavorite[]>(`/client/api/fields/favorites`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      select,
    }
  );
