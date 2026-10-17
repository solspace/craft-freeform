import config from "@config/freeform/freeform.config";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { QKGroups } from "@ff-client/queries/form-groups";
import { QKForms } from "@ff-client/queries/forms";
import { QKIntegrations } from "@ff-client/queries/integrations";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback } from "react";

export type AiIntegrationOption = {
  id: number;
  uid: string;
  name: string;
  handle: string;
  model: string;
  referenceMimeTypes: string[];
};

export const useAiIntegrations = (): UseQueryResult<AiIntegrationOption[]> => {
  return useQuery({
    queryKey: [...QKIntegrations.navigation, "ai-list"],
    queryFn: async () => {
      const { data } = await axios.get<AiIntegrationOption[]>(
        "/api/forms/ai-options",
      );
      return data;
    },
    enabled:
      config.metadata.freeform.canCreate &&
      config.editions.edition === "pro" &&
      config.permissions.integrations !== "none",
    gcTime: Infinity,
    staleTime: 60_000,
  });
};

export const useRefreshGeneratedForms = (): (() => void) => {
  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();
  const site = getCurrentHandleWithFallback();

  return useCallback(() => {
    // Refresh lists only. Invalidating the forms prefix could refetch and
    // replace the state of a different form currently open in the builder.
    void queryClient.invalidateQueries({
      queryKey: QKForms.all(site),
      exact: true,
    });
    void queryClient.invalidateQueries({
      queryKey: QKGroups.all(site),
      exact: true,
    });
  }, [queryClient, site]);
};
