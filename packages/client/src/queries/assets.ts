import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type AssetUrl = {
  title: string;
  src: string;
  srcset: string;
};

export type AssetUrlRecords = Record<number, AssetUrl>;

export const useAssetQuery = (
  assetIds: number[] = [],
  transform?: string
): UseQueryResult<AssetUrlRecords> => {
  return useQuery({
    queryKey: ['assets', 'urls', assetIds?.sort(), transform],
    queryFn: () =>
      axios
        .get<AssetUrlRecords>(
          `/api/assets/urls?ids=${assetIds.join(',')}&transform=${transform || ''}`
        )
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: assetIds.length > 0,
  });
};
