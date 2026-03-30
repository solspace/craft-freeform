import type { PageType } from "@ff-client/types/pages";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";

const QKPageType = {
  all: ["page-type"] as const,
};

type FetchFieldTypesQuery = () => UseQueryResult<PageType, AxiosError>;

export const useFetchPageButtonType: FetchFieldTypesQuery = () =>
  useQuery<PageType, AxiosError>({
    queryKey: QKPageType.all,
    queryFn: () =>
      axios.get<PageType>(`/api/types/page-buttons`).then((res) => res.data),
    staleTime: Infinity,
  });
