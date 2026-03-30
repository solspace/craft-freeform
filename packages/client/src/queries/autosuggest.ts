import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type EnvOption = {
  name: string;
  hint?: string;
};

type Category = {
  label: string;
  data: EnvOption[];
};

export type EnvironmentSuggestionCategories = Category[];

export const useAutosuggestEnvVariables = (
  enabled: boolean = true,
): UseQueryResult<EnvironmentSuggestionCategories> => {
  return useQuery<EnvironmentSuggestionCategories>({
    queryKey: ["autosuggest", "env"],
    queryFn: () =>
      axios
        .get<EnvironmentSuggestionCategories>("/api/autosuggest/env")
        .then((res) => res.data),
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
