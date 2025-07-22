import { QKIntegrations } from '@ff-client/queries/integrations';
import type { IntegrationType } from '@ff-client/types/integrations';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { Integration } from '../integration.types';

export const useIntegrationProperties = (
  type: IntegrationType,
  integration: string,
  id: string
): UseQueryResult<Integration | null> => {
  let url = `/api/integrations/properties/`;
  if (id) {
    url += id;
  } else {
    url += `${type}/${integration}`;
  }

  return useQuery(QKIntegrations.properties(type, integration, id), () =>
    axios.get(url).then((response) => response.data)
  );
};
