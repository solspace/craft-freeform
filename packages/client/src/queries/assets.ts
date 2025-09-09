import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type AssetUrl = {
  title: string;
  url: string;
};

export type AssetUrlRecords = Record<number, AssetUrl>;

export const useAssetQuery = (
  assetIds: number[],
  transform?: string
): UseQueryResult<AssetUrlRecords> =>
  useQuery(
    ['assets', 'urls', assetIds.sort(), transform],
    () =>
      axios
        .get<AssetUrlRecords>(
          `/api/assets/urls?ids=${assetIds.join(',')}&transform=${transform}`
        )
        .then((res) => res.data),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: assetIds.length > 0,
    }
  );
