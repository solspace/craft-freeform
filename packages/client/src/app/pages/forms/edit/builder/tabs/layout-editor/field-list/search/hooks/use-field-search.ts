import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  selectQuery,
  updateQuery,
} from '@ff-client/app/pages/forms/edit/store/slices/search';
import { useDebounce } from '@ff-client/hooks/use-debounce';

type FieldSearch = () => [string, Dispatch<SetStateAction<string>>];

export const useFieldSearch: FieldSearch = () => {
  const dispatch = useDispatch();

  const query = useSelector(selectQuery(Search.Fields));
  const [localQuery, setLocalQuery] = useState(query);
  const debouncedQuery = useDebounce(localQuery, 100);

  useEffect(() => {
    dispatch(updateQuery({ type: Search.Fields, query: debouncedQuery }));
  }, [debouncedQuery]);

  return [localQuery, setLocalQuery];
};
