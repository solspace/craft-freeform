import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { Card } from './cards.types';

export type AssetUrl = {
  title: string;
  url: string;
};

type AssetUrlRecords = Record<number, AssetUrl>;

export const useCardAssetUrls = (
  cards: Card[],
  transform?: string
): UseQueryResult<AssetUrlRecords> => {
  const assetIds = cards
    .map((card) => card.assetId)
    .filter(Boolean) as number[];

  return useQuery(
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
};
