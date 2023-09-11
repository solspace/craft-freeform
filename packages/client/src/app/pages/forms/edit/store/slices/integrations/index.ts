import type { Integration } from '@ff-client/types/integrations';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import './integrations.persistence';

export type IntegrationEntry = {
  values: { [key: string]: GenericValue };
  dirtyValues: { [key: string]: GenericValue };
} & Integration;

type IntegrationModificationPayload = {
  id: number;
  key: string;
  value: GenericValue;
};

const initialState: IntegrationEntry[] = [];

const findIntegration = (
  state: IntegrationEntry[],
  id: number
): IntegrationEntry | undefined => {
  return state.find((item) => item.id === id);
};

export const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Integration[]>) => {
      action.payload.forEach((integration) => {
        const values: { [key: string]: GenericValue } = {};
        integration.properties.forEach((prop) => {
          values[prop.handle] = prop.value;
        });

        state.push({
          dirtyValues: {},
          values,
          ...integration,
        });
      });
    },
    toggle: (state, action: PayloadAction<number>) => {
      const integration = findIntegration(state, action.payload);
      integration.enabled = !integration.enabled;
    },
    modify: (state, action: PayloadAction<IntegrationModificationPayload>) => {
      const { id, key, value } = action.payload;
      const integration = findIntegration(state, id);

      integration.values[key] = value;
      integration.dirtyValues = {
        ...integration.dirtyValues,
        [key]: value,
      };
    },
    cleanDirtyValues: (state) => {
      state.forEach((integration) => {
        integration.dirtyValues = {};
      });
    },
    emptyIntegrations: (state) => {
      state.length = 0;
    },
  },
});

const { actions } = integrationsSlice;
export { actions as integrationActions };

export default integrationsSlice.reducer;
