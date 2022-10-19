import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Search,
  selectQuery,
} from '@ff-client/app/pages/forms/edit/store/slices/search';
import type { FieldType } from '@ff-client/types/fields';

type SelectSearchedFields = () => (data: FieldType[]) => FieldType[];

export const useSelectSearchedFields: SelectSearchedFields = () => {
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
