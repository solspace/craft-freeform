import config from "@config/freeform/freeform.config";
import { QKIntegrations } from "@ff-client/queries/integrations";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      config.permissions.integrations !== "none",
    gcTime: Infinity,
    staleTime: 60_000,
  });
};
