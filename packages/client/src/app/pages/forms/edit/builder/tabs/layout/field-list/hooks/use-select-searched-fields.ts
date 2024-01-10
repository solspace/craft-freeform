import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Search } from '@editor/store/slices/search';
import { searchSelectors } from '@editor/store/slices/search/search.selectors';
import type {
  FieldFavorite,
  FieldForm,
  FieldType,
} from '@ff-client/types/fields';
import type { Group } from '@ff-client/types/groups';

type SelectSearchedFields<T> = () => (data: T[]) => T[];
type SelectSearchedGroupFields<T> = () => (data: T) => T;

export const useSelectSearchedGroups: SelectSearchedGroupFields<Group> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
    (data: Group): Group => {
      if (!searchQuery) {
        return data;
      }

      const filterTypes = data.types?.filter((type) =>
        type.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredGrouped = data.groups.grouped
        .map((group) => ({
          ...group,
          types: group.types.filter((item) =>
            item.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((group) => group.types.length > 0);

      return {
        types: filterTypes || [],
        groups: {
          ...data.groups,
          grouped: filteredGrouped || [],
        },
      };
    },
    [searchQuery]
  );
};

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
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
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
                field.label.toLowerCase().includes(searchQuery.toLowerCase())
              ),
            }) as FieldForm
        )
        .filter((form) => form.fields.length > 0);
    },
    [searchQuery]
  );
};
