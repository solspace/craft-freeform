import { useSiteContext } from "@ff-client/contexts/site/site.context";
import type { FieldForm } from "@ff-client/types/fields";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";

export const QKForms = {
  all: (site?: string) => ["field-forms", site] as const,
};

type FetchFormsQuery = (options?: {
  select?: (data: FieldForm[]) => FieldForm[];
}) => UseQueryResult<FieldForm[], AxiosError>;

export const useFetchForms: FetchFormsQuery = ({ select } = {}) => {
  const { current: currentSite } = useSiteContext();

  return useQuery<FieldForm[], AxiosError>({
    queryKey: QKForms.all(currentSite?.handle),
    queryFn: () =>
      axios
        .get<FieldForm[]>(`/api/fields/forms`, {
          params: { site: currentSite?.handle },
        })
        .then((res) => res.data),
    staleTime: Infinity,
    select,
  });
};
