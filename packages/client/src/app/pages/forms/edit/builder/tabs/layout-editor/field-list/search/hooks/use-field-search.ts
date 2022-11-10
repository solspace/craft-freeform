import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Search, updateQuery } from '@editor/store/slices/search';
import { useDebounce } from '@ff-client/hooks/use-debounce';

type FieldSearch = () => [string, Dispatch<SetStateAction<string>>];

export const useFieldSearch: FieldSearch = () => {
  const dispatch = useDispatch();

  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 1000);

  useEffect(() => {
    dispatch(updateQuery({ type: Search.Fields, query: debouncedQuery }));
  }, [debouncedQuery]);

  return [localQuery, setLocalQuery];
};
