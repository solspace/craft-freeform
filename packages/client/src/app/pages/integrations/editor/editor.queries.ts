import config from "@config/freeform/freeform.config";
import { QKIntegrations } from "@ff-client/queries/integrations";
import type { APIError } from "@ff-client/types/api";
import type { IntegrationType } from "@ff-client/types/integrations";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import type { Integration } from "../integration.types";

import type { IntegrationState } from "./editor.types";

export const useIntegrationProperties = (
  type: IntegrationType,
  integration: string,
  id: string,
): UseQueryResult<Integration | null> => {
  const edition = config.editions.edition;

  let url = `/api/integrations/properties/`;
  if (id && id !== "new") {
    url += id;
  } else {
    url += `${type}/${integration}`;
  }

  return useQuery({
    queryKey: QKIntegrations.properties(type, integration, id),
    queryFn: () =>
      axios
        .get(url)
        .then((response) => response.data)
        .then((data) => {
          return {
            ...data,
            supported:
              data.type.editions.length === 0 ||
              data.type.editions.includes(edition),
          };
        }),
  });
};

export const useIntegrationMutation = (
  className: string,
  id?: string,
  onError?: (error: APIError) => void,
): UseMutationResult => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: IntegrationState) => {
      const payload = {
        class: className,
        values,
      };

      return axios
        .post(`/api/integrations${id && id !== "new" ? `/${id}` : ""}`, payload)
        .then((response) => response.data);
    },
    onSuccess: (response) => {
      const { id, type, integration } = response;

      notifications.success(translate("Integration saved successfully"));

      queryClient.invalidateQueries({ queryKey: QKIntegrations.navigation });
      queryClient.invalidateQueries({ queryKey: QKIntegrations.single(id) });

      if (id) {
        navigate(`/integrations/${type}/${integration}/${id}`);
      }
    },
    onError,
  });
};
