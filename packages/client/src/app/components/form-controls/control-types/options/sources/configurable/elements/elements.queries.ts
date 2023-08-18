import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { OptionTypeProvider } from '../../sources.types';

export const useOptionTypesElements = (): UseQueryResult<
  OptionTypeProvider[]
> => {
  return useQuery<OptionTypeProvider[]>(
    ['option-types', 'elements'],
    () => axios.get('/api/types/options/elements').then((res) => res.data),
    { staleTime: Infinity }
  );
};
