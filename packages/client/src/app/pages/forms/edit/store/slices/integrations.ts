import type { RootState } from '@editor/store';
import type { Integration } from '@ff-client/types/integrations';
import type { GenericValue, Property } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { SaveSubscriber } from '../middleware/state-persist';
import { TOPIC_SAVE } from '../middleware/state-persist';

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

const findProperty = (
  integration: IntegrationEntry,
  key: string
): Property | undefined => {
  return integration.properties.find((property) => property.handle === key);
};

export const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    addIntegrations: (state, action: PayloadAction<Integration[]>) => {
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
    toggleIntegration: (state, action: PayloadAction<number>) => {
      const integration = findIntegration(state, action.payload);
      integration.enabled = !integration.enabled;
    },
    modifyIntegrationProperty: (
      state,
      action: PayloadAction<IntegrationModificationPayload>
    ) => {
      const { id, key, value } = action.payload;
      const integration = findIntegration(state, id);
      const property = findProperty(integration, key);

      integration.values[key] = value;
      integration.dirtyValues = {
        ...integration.dirtyValues,
        [key]: value,
      };

      if (
        integration.dirtyValues[key] !== undefined &&
        integration.dirtyValues[key] === property.value
      ) {
        delete integration.dirtyValues[key];
      }
    },
  },
});

export const { addIntegrations, toggleIntegration, modifyIntegrationProperty } =
  integrationsSlice.actions;

export const selectIntegration =
  (id: number) =>
  (state: RootState): IntegrationEntry =>
    state.integrations.find((item) => item.id === id);

export default integrationsSlice.reducer;

const persistIntegrations: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.integrations = state.integrations.map((integration) => ({
    id: integration.id,
    enabled: Boolean(integration.enabled),
    values: integration.dirtyValues,
  }));
};

PubSub.subscribe(TOPIC_SAVE, persistIntegrations);
