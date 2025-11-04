import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { OptionTypeProvider } from '../../sources.types';

export const useOptionTypesPredefined = (): UseQueryResult<
  OptionTypeProvider[]
> => {
  return useQuery<OptionTypeProvider[]>({
    queryKey: ['option-types', 'predefined'],
    queryFn: () =>
      axios.get('/api/types/options/predefined').then((res) => res.data),
    staleTime: Infinity,
  });
};
