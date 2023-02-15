import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Search,
  selectQuery,
} from '@ff-client/app/pages/forms/edit/store/slices/search';
import type { FieldFavorite, FieldType } from '@ff-client/types/fields';

type SelectSearchedFields<T> = () => (data: T[]) => T[];

export const useSelectSearchedFields: SelectSearchedFields<FieldType> = () => {
  const searchQuery = useSelector(selectQuery(Search.Fields));
  const select = useCallback(
    (data: FieldType[]) => {
      if (!searchQuery) {
        return data;
      }

      return data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery)
      );
    },
    [searchQuery]
  );

  return select;
};

export const useSelectSearchedFavorites: SelectSearchedFields<
  FieldFavorite
> = () => {
  const searchQuery = useSelector(selectQuery(Search.Fields));
  const select = useCallback(
    (data: FieldFavorite[]) => {
      if (!searchQuery) {
        return data;
      }

      return data.filter((item) =>
        item.label.toLowerCase().includes(searchQuery)
      );
    },
    [searchQuery]
  );

  return select;
};
