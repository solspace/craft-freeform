import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
