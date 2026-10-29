import { isEnvTrue } from "@components/form-controls/control-types/bool-env/bool-env.operations";
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

/** Undefined means an environment lookup is still pending or could not be completed. */
export function useResolvedBoolean(
  value: unknown,
  enabled = true,
): boolean | undefined {
  const variable =
    typeof value === "string" && value.startsWith("$") ? value : undefined;
  const { data } = useQuery<boolean>({
    queryKey: ["autosuggest", "boolean-env", variable],
    queryFn: ({ signal }) =>
      axios
        .get<boolean>("/api/autosuggest/boolean-env", {
          params: { value: variable },
          signal,
        })
        .then((response) => response.data),
    enabled: enabled && Boolean(variable),
    staleTime: 30000,
    retry: false,
  });
  return variable ? data : isEnvTrue(value);
}

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
