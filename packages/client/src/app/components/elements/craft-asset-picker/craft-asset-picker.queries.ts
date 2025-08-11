import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { CraftAsset } from './craft-asset-picker.types';

const QKCraftAssetPreviews = {
  all: ['craft-asset-previews'],
  byIds: (ids: number[]) => [...QKCraftAssetPreviews.all, { ids }],
} as const;

export const useAssetPreviewQuery = (
  ids: number[]
): UseQueryResult<CraftAsset[]> => {
  return useQuery(
    QKCraftAssetPreviews.byIds(ids),
    () =>
      axios
        .get<CraftAsset[]>(`api/assets?ids=${ids.join(',')}`)
        .then((res) => res.data),
    { staleTime: Infinity, cacheTime: Infinity, enabled: ids?.length > 0 }
  );
};
