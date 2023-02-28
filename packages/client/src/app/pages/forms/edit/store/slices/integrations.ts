import type { RootState } from '@editor/store';
import type { Integration } from '@ff-client/types/integrations';
import type { Property } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type IntegrationState = {
  updated: number;
  dirty: boolean;
} & Integration;

type IntegrationModificationPayload = {
  id: number;
  key: string;
  value: string | number | boolean;
};

const initialState: IntegrationState[] = [];

const findIntegration = (
  state: IntegrationState[],
  id: number
): IntegrationState | undefined => {
  return state.find((item) => item.id === id);
};

const findProperty = (
  integration: IntegrationState,
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
        state.push({
          updated: 1,
          dirty: false,
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
      property.value = value;
    },
  },
});

export const { addIntegrations, toggleIntegration, modifyIntegrationProperty } =
  integrationsSlice.actions;

export const selectIntegration =
  (id: number) =>
  (state: RootState): IntegrationState =>
    state.integrations.find((item) => item.id === id);

export default integrationsSlice.reducer;
