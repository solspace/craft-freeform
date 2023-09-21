import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Search } from '@editor/store/slices/search';
import { searchSelectors } from '@editor/store/slices/search/search.selectors';
import type {
  FieldFavorite,
  FieldForm,
  FieldType,
} from '@ff-client/types/fields';

type SelectSearchedFields<T> = () => (data: T[]) => T[];

export const useSelectSearchedFields: SelectSearchedFields<FieldType> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
    (data: FieldType[]) => {
      if (!searchQuery) {
        return data;
      }

      return data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
    [searchQuery]
  );
};

export const useSelectSearchedFavorites: SelectSearchedFields<
  FieldFavorite
> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
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
};

export const useSelectSearchedForms: SelectSearchedFields<FieldForm> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
    (data: FieldForm[]): FieldForm[] => {
      if (!searchQuery) {
        return data;
      }

      return data
        .map(
          (form) =>
            ({
              ...form,
              fields: form.fields.filter((field) =>
                field.label.toLowerCase().includes(searchQuery)
              ),
            }) as FieldForm
        )
        .filter((form) => form.fields.length > 0);
    },
    [searchQuery]
  );
};
