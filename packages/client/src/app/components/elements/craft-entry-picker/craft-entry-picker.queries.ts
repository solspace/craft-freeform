import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { CraftEntry } from "./craft-entry-picker.types";

const QKCraftAssetPreviews = {
  all: ["craft-asset-previews"],
  byIds: (ids: number[]) => [...QKCraftAssetPreviews.all, { ids }],
} as const;

export const useEntryQuery = (ids: number[]): UseQueryResult<CraftEntry[]> => {
  return useQuery({
    queryKey: QKCraftAssetPreviews.byIds(ids),
    queryFn: () =>
      axios
        .get<CraftEntry[]>(`api/entries?ids=${ids.join(",")}`)
        .then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: ids?.length > 0,
  });
};
